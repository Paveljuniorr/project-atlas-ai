import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { listAppointments, createAppointment } from "@/server/services/appointment-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const appointmentSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().min(1).max(200),
  startsAt: z.string(),
  endsAt: z.string(),
  attendeeEmail: z.string().email().optional(),
  attendeeName: z.string().max(100).optional(),
  conversationId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await getUserContext("meetings:read");
    const { searchParams } = new URL(req.url);
    const upcomingOnly = searchParams.get("upcoming") !== "false";
    const appointments = await listAppointments(ctx.orgId, upcomingOnly);
    return apiSuccess(appointments);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("meetings:write");
    const body = appointmentSchema.parse(await req.json());
    const appointment = await createAppointment(ctx, body);
    return apiSuccess(appointment, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
