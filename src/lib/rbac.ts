import { getServerSession } from "next-auth";
import { createServerServiceClient } from "@/lib/supabase";

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
  | "org:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: [
    "leads:read", "leads:create", "leads:update", "leads:delete",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write",
    "settings:read", "settings:write", "org:manage"
  ],
  Admin: [
    "leads:read", "leads:create", "leads:update", "leads:delete",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write",
    "settings:read", "settings:write", "org:manage"
  ],
  Manager: [
    "leads:read", "leads:create", "leads:update",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write", "settings:read"
  ],
  Sales: [
    "leads:read", "leads:create", "leads:update",
    "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "meetings:write",
    "tasks:read", "tasks:write"
  ],
  Support: [
    "leads:read", "inbox:read", "inbox:write", "ai:generate",
    "meetings:read", "tasks:read"
  ],
  Member: [
    "leads:read", "inbox:read", "meetings:read", "tasks:read"
  ]
};

export interface UserContext {
  userId: string;
  email: string;
  name?: string;
  orgId: string;
  role: Role;
}

/**
 * Resolves current user session, organization ID, and role.
 * Enforces mandatory authentication, organization membership, and permission checks.
 */
export async function getUserContext(requiredPermission?: Permission): Promise<UserContext> {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const supabase = createServerServiceClient();

  // Resolve user record & associated organization
  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("id, email, name, organization_id, role")
    .eq("email", session.user.email)
    .maybeSingle();

  let orgId = dbUser?.organization_id;
  let role: Role = (dbUser?.role as Role) || "Owner";

  // Auto-provision default workspace if not yet linked
  if (!orgId) {
    const orgName = `${session.user.name || "User"}'s Workspace`;
    const { data: newOrg } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        ai_settings: { tone: "professional" }
      })
      .select("id")
      .single();

    orgId = newOrg?.id;

    if (dbUser?.id) {
      await supabase
        .from("users")
        .update({ organization_id: orgId, role: "Owner" })
        .eq("id", dbUser.id);
    } else {
      await supabase
        .from("users")
        .insert({
          email: session.user.email,
          name: session.user.name,
          avatar_url: session.user.image,
          organization_id: orgId,
          role: "Owner"
        });
    }
  }

  if (!orgId) {
    throw new Error("FORBIDDEN: No active organization workspace found");
  }

  // Check role permission if specified
  if (requiredPermission) {
    const allowed = ROLE_PERMISSIONS[role]?.includes(requiredPermission);
    if (!allowed) {
      throw new Error(`FORBIDDEN: Insufficient permissions for ${requiredPermission}`);
    }
  }

  return {
    userId: dbUser?.id || session.user.email,
    email: session.user.email,
    name: session.user.name || undefined,
    orgId,
    role
  };
}
