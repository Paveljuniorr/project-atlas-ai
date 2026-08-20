import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { getDashboardMetrics } from "@/server/services/dashboard-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";

export async function GET(_req: NextRequest) {
  try {
    const ctx = await getUserContext("analytics:read");
    const metrics = await getDashboardMetrics(ctx.orgId);
    return apiSuccess(metrics);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
