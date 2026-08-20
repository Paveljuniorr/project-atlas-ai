import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import {
  listTeamMembers,
  inviteTeamMember,
  updateUserRole,
  removeTeamMember,
} from "@/server/services/team-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Owner", "Admin", "Manager", "Sales", "Support", "Member"]),
});

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["Owner", "Admin", "Manager", "Sales", "Support", "Member"]),
});

export async function GET() {
  try {
    const ctx = await getUserContext("org:manage");
    const data = await listTeamMembers(ctx.orgId);
    return apiSuccess(data);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("org:manage");
    const body = inviteSchema.parse(await req.json());
    const result = await inviteTeamMember(ctx, body);
    return apiSuccess(result, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getUserContext("org:manage");
    const body = updateRoleSchema.parse(await req.json());
    const updated = await updateUserRole(ctx, body.userId, body.role);
    return apiSuccess(updated);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getUserContext("org:manage");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) throw new Error("VALIDATION: userId is required");
    const result = await removeTeamMember(ctx, userId);
    return apiSuccess(result);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
