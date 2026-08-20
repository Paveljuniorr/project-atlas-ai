import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { getAvailableAppointmentSlots } from "@/server/services/appointment-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getUserContext("meetings:read");
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from") || new Date().toISOString();
    const to =
      searchParams.get("to") ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const duration = Number(searchParams.get("duration") || 30);
    const assignedUserId = searchParams.get("userId") || undefined;

    const result = await getAvailableAppointmentSlots(
      ctx.orgId,
      from,
      to,
      duration,
      assignedUserId
    );

    return apiSuccess(result);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
