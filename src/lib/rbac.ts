"use server";

import { currentUser, auth } from "@clerk/nextjs/server";
import { createServerServiceClient } from "@/lib/supabase";
import { writeAuditLog } from "@/server/events/event-bus";

export type Role = "Owner" | "Admin" | "Manager" | "Sales" | "Support" | "Member";

export type Permission =
  | "leads:read"
  | "leads:create"
  | "leads:update"
  | "leads:delete"
  | "inbox:read"
  | "inbox:write"
  | "ai:generate"
  | "meetings:read"
  | "meetings:write"
  | "tasks:read"
  | "tasks:write"
  | "settings:read"
  | "settings:write"
  | "org:manage"
  | "integrations:manage"
  | "automations:manage"
  | "analytics:read";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: [
    "leads:read", "leads:create", "leads:update", "leads:delete",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write",
    "settings:read", "settings:write", "org:manage",
    "integrations:manage", "automations:manage", "analytics:read",
  ],
  Admin: [
    "leads:read", "leads:create", "leads:update", "leads:delete",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write",
    "settings:read", "settings:write", "org:manage",
    "integrations:manage", "automations:manage", "analytics:read",
  ],
  Manager: [
    "leads:read", "leads:create", "leads:update",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write", "settings:read", "analytics:read",
  ],
  Sales: [
    "leads:read", "leads:create", "leads:update",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write",
  ],
  Support: [
    "leads:read", "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "tasks:read",
  ],
  Member: ["leads:read", "inbox:read", "meetings:read", "tasks:read", "analytics:read"],
};

export interface UserContext {
  userId: string;
  email: string;
  name?: string;
  orgId: string;
  role: Role;
}

function normalizeRole(role: string | null | undefined): Role {
  const map: Record<string, Role> = {
    owner: "Owner",
    admin: "Admin",
    agent: "Sales",
    viewer: "Member",
    Owner: "Owner",
    Admin: "Admin",
    Manager: "Manager",
    Sales: "Sales",
    Support: "Support",
    Member: "Member",
  };
  return map[role || ""] || "Owner";
}

/**
 * Resolves authenticated user + organization from Clerk session.
 * Automatically provisions the user and default workspace in Supabase on first login.
 */
export async function getUserContext(requiredPermission?: Permission): Promise<UserContext> {
  const clerkUser = await currentUser();

  if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const email = clerkUser.emailAddresses[0].emailAddress.toLowerCase();
  const supabase = createServerServiceClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, name, org_id, role, status")
    .eq("email", email)
    .maybeSingle();

  let orgId = dbUser?.org_id;
  let role = normalizeRole(dbUser?.role);
  let userId = dbUser?.id;

  if (dbUser?.status === "deactivated") {
    throw new Error("FORBIDDEN: Account deactivated");
  }

  const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || email;

  // First time login — provision Organization and User
  if (!orgId) {
    const orgName = `${clerkUser.firstName ? `${clerkUser.firstName}'s` : "Atlas AI"} Workspace`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const { data: newOrg, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        slug,
        ai_settings: { tone: "professional", humanInTheLoop: true },
      })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      throw new Error("FORBIDDEN: Failed to provision organization workspace");
    }

    orgId = newOrg.id;

    const userPayload = {
      email,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      name: fullName,
      avatar_url: clerkUser.imageUrl || null,
      google_id: clerkUser.externalAccounts?.find(a => a.provider === "google")?.providerUserId || null,
      org_id: orgId,
      role: "Owner",
      status: "active",
      last_login_at: new Date().toISOString(),
    };

    if (dbUser?.id) {
      await supabase.from("users").update(userPayload).eq("id", dbUser.id);
      userId = dbUser.id;
    } else {
      const { data: newUser } = await supabase.from("users").insert(userPayload).select("id").single();
      userId = newUser?.id || clerkUser.id;
    }

    role = "Owner";

    await writeAuditLog({
      orgId,
      actorUserId: userId,
      action: "user.signup",
      summary: `Workspace '${orgName}' initialized for ${email} (Google sign-in)`,
    });
  } else {
    // Existing user login — record activity
    await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
        avatar_url: clerkUser.imageUrl || undefined,
        name: fullName,
      })
      .eq("email", email);
  }

  if (requiredPermission) {
    const allowed = ROLE_PERMISSIONS[role]?.includes(requiredPermission);
    if (!allowed) {
      throw new Error(`FORBIDDEN: Insufficient permissions for ${requiredPermission}`);
    }
  }

  return {
    userId: userId || clerkUser.id,
    email,
    name: fullName,
    orgId,
    role,
  };
}

export async function getApiKeyContext(
  apiKey: string,
  requiredScope?: string
): Promise<{ orgId: string; keyId: string; scopes: string[] }> {
  const { hashSecret } = await import("@/server/security/crypto");
  const supabase = createServerServiceClient();

  const { data: keyRecord } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", hashSecret(apiKey))
    .eq("status", "active")
    .maybeSingle();

  if (!keyRecord) {
    throw new Error("UNAUTHORIZED: Invalid API key");
  }

  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    throw new Error("UNAUTHORIZED: API key expired");
  }

  if (requiredScope && !keyRecord.scopes?.includes(requiredScope)) {
    throw new Error("FORBIDDEN: API key missing required scope");
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id);

  return { orgId: keyRecord.org_id, keyId: keyRecord.id, scopes: keyRecord.scopes || [] };
}
