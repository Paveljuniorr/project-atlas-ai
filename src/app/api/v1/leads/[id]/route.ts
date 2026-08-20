import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { updateLeadRecord, archiveLead, getLeadActivity } from "@/server/services/lead-service";
import { createServerServiceClient } from "@/server/db/client";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getUserContext("leads:read");
    const { id } = await params;
    const supabase = createServerServiceClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("org_id", ctx.orgId)
      .single();

    if (error || !lead) {
      return mapErrorToResponse(new Error("NOT_FOUND: Lead not found"));
    }

    const activity = await getLeadActivity(ctx.orgId, id);
    return apiSuccess({ lead, activity });
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getUserContext("leads:update");
    const { id } = await params;
    const body = await req.json();
    const lead = await updateLeadRecord(ctx, id, body);
    return apiSuccess(lead);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getUserContext("leads:delete");
    const { id } = await params;
    await archiveLead(ctx, id);
    return apiSuccess({ archived: true });
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
