import { createServerServiceClient } from "@/server/db/client";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function getAvailableAppointmentSlots(
  orgId: string,
  from: string,
  to: string,
  durationMinutes: number,
  assignedUserId?: string
) {
  const supabase = createServerServiceClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", orgId)
    .single();

  const timezone = org?.timezone || "UTC";
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Fetch existing appointments in range
  let apptQuery = supabase
    .from("appointments")
    .select("starts_at, ends_at, assigned_user_id")
    .eq("org_id", orgId)
    .in("status", ["scheduled", "confirmed"])
    .gte("starts_at", fromDate.toISOString())
    .lte("ends_at", toDate.toISOString());

  if (assignedUserId) apptQuery = apptQuery.eq("assigned_user_id", assignedUserId);

  const { data: existing } = await apptQuery;

  const slots: { startsAt: string; endsAt: string }[] = [];
  const slotMs = durationMinutes * 60 * 1000;
  const workStart = 9;
  const workEnd = 17;

  for (let d = new Date(fromDate); d < toDate; d.setDate(d.getDate() + 1)) {
    for (let hour = workStart; hour < workEnd; hour++) {
      const start = new Date(d);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + slotMs);

      const overlaps = existing?.some(
        (a) => new Date(a.starts_at) < end && new Date(a.ends_at) > start
      );
      if (!overlaps && start > new Date()) {
        slots.push({ startsAt: start.toISOString(), endsAt: end.toISOString() });
      }
    }
  }

  return { timezone, slots: slots.slice(0, 10) };
}

export async function createAppointment(
  ctx: UserContext,
  input: {
    leadId: string;
    title: string;
    startsAt: string;
    endsAt: string;
    attendeeEmail?: string;
    attendeeName?: string;
    conversationId?: string;
  }
) {
  const supabase = createServerServiceClient();

  // Double-booking check
  const { data: conflicts } = await supabase
    .from("appointments")
    .select("id")
    .eq("org_id", ctx.orgId)
    .eq("assigned_user_id", ctx.userId)
    .in("status", ["scheduled", "confirmed"])
    .lt("starts_at", input.endsAt)
    .gt("ends_at", input.startsAt);

  if (conflicts?.length) {
    throw new Error("CONFLICT: Time slot is no longer available");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("timezone")
    .eq("id", ctx.orgId)
    .single();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      org_id: ctx.orgId,
      lead_id: input.leadId,
      conversation_id: input.conversationId ?? null,
      assigned_user_id: ctx.userId,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      timezone: org?.timezone || "UTC",
      attendee_email: input.attendeeEmail,
      attendee_name: input.attendeeName,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create appointment");

  await supabase
    .from("leads")
    .update({ stage_id: "qualified", next_follow_up_at: input.startsAt })
    .eq("id", input.leadId)
    .eq("org_id", ctx.orgId);

  await emitEvent("appointment.created", ctx.orgId, {
    appointmentId: appointment.id,
    leadId: input.leadId,
  });

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "appointment.created",
    entityType: "appointment",
    entityId: appointment.id,
    summary: `Appointment scheduled: ${input.title}`,
  });

  return appointment;
}

export async function listAppointments(orgId: string, upcomingOnly = true) {
  const supabase = createServerServiceClient();
  let query = supabase
    .from("appointments")
    .select("*, lead:leads(first_name, last_name, company_name)")
    .eq("org_id", orgId)
    .order("starts_at", { ascending: true });

  if (upcomingOnly) {
    query = query.gte("starts_at", new Date().toISOString()).in("status", ["scheduled", "confirmed"]);
  }

  const { data, error } = await query.limit(50);
  if (error) throw new Error("Failed to fetch appointments");
  return data ?? [];
}

export async function cancelAppointment(ctx: UserContext, appointmentId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error || !data) throw new Error("NOT_FOUND: Appointment not found");

  await emitEvent("appointment.cancelled", ctx.orgId, { appointmentId });
  return data;
}
