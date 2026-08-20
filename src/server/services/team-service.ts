import { createServerServiceClient } from "@/server/db/client";
import { writeAuditLog } from "@/server/events/event-bus";
import { randomBytes } from "crypto";
import { hashSecret, normalizeEmail } from "@/server/security/crypto";
import type { UserContext, Role } from "@/server/auth/context";

export async function listTeamMembers(orgId: string) {
  const supabase = createServerServiceClient();
  const [{ data: users, error: usersErr }, { data: invitations, error: invErr }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, email, first_name, last_name, name, role, status, avatar_url, last_login_at, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: true }),
      supabase
        .from("invitations")
        .select("id, email, role, status, expires_at, created_at")
        .eq("org_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  if (usersErr) throw new Error("Failed to fetch team members");
  return {
    members: users ?? [],
    pendingInvitations: invitations ?? [],
  };
}

export async function inviteTeamMember(
  ctx: UserContext,
  input: {
    email: string;
    role: Role;
  }
) {
  const supabase = createServerServiceClient();
  const emailNorm = normalizeEmail(input.email);

  // Check if already in org
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("org_id", ctx.orgId)
    .eq("email", emailNorm)
    .maybeSingle();

  if (existingUser) {
    throw new Error("CONFLICT: User already belongs to this organization");
  }

  const rawToken = randomBytes(24).toString("hex");
  const tokenHash = hashSecret(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      org_id: ctx.orgId,
      email: input.email,
      email_normalized: emailNorm,
      role: input.role,
      token_hash: tokenHash,
      invited_by_id: ctx.userId,
      status: "pending",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create invitation");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "team.invited",
    entityType: "invitation",
    entityId: invitation.id,
    summary: `Invited ${input.email} as ${input.role}`,
  });

  return {
    invitation,
    inviteUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/accept-invite?token=${rawToken}`,
  };
}

export async function updateUserRole(
  ctx: UserContext,
  targetUserId: string,
  newRole: Role
) {
  const supabase = createServerServiceClient();

  // Protect against demoting the only owner or modifying oneself if not owner
  const { data: targetUser } = await supabase
    .from("users")
    .select("id, role, email")
    .eq("id", targetUserId)
    .eq("org_id", ctx.orgId)
    .single();

  if (!targetUser) throw new Error("NOT_FOUND: User not found in organization");

  const { data, error } = await supabase
    .from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetUserId)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error) throw new Error("Failed to update user role");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "team.role_updated",
    entityType: "user",
    entityId: targetUserId,
    summary: `Updated role of ${targetUser.email} to ${newRole}`,
  });

  return data;
}

export async function removeTeamMember(ctx: UserContext, targetUserId: string) {
  if (ctx.userId === targetUserId) {
    throw new Error("VALIDATION: Cannot remove yourself from the organization");
  }

  const supabase = createServerServiceClient();
  const { error } = await supabase
    .from("users")
    .update({ status: "deactivated", org_id: null })
    .eq("id", targetUserId)
    .eq("org_id", ctx.orgId);

  if (error) throw new Error("Failed to remove team member");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "team.member_removed",
    entityType: "user",
    entityId: targetUserId,
    summary: `Removed member ${targetUserId} from organization`,
  });

  return { success: true };
}
