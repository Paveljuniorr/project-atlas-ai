import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { listLeads, createLeadRecord } from "@/server/services/lead-service";
import { createLeadSchema } from "@/lib/validators";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { getApiKeyContext } from "@/lib/rbac";

async function resolveOrg(req: NextRequest, permission: "leads:read" | "leads:create") {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer atlas_")) {
    const ctx = await getApiKeyContext(authHeader.slice(7), permission);
    return { orgId: ctx.orgId, userId: ctx.keyId };
  }
  const ctx = await getUserContext(permission);
  return { orgId: ctx.orgId, userId: ctx.userId };
}

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await resolveOrg(req, "leads:read");
    const { searchParams } = new URL(req.url);
    const result = await listLeads(orgId, {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 25),
      search: searchParams.get("search") || undefined,
      stageId: searchParams.get("stage") || undefined,
      source: searchParams.get("source") || undefined,
      sort: searchParams.get("sort") || undefined,
    });
    return apiSuccess(result.leads, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("leads:create");
    const body = await req.json();
    const validated = createLeadSchema.parse(body);
    const lead = await createLeadRecord(ctx, validated);
    return apiSuccess(lead, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
