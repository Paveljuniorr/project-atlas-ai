import { NextRequest } from "next/server";
import { registerAutomation } from "@/server/automation/dispatcher";
import { getUserContext } from "@/lib/rbac";
import { createServerServiceClient } from "@/server/db/client";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

export async function GET() {
  try {
    const ctx = await getUserContext("automations:manage");
    const supabase = createServerServiceClient();
    const { data } = await supabase
      .from("automations")
      .select("id, name, status, endpoint_url, subscribed_events, created_at")
      .eq("org_id", ctx.orgId);
    return apiSuccess(data ?? []);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

const schema = z.object({
  name: z.string().min(1),
  endpointUrl: z.string().url(),
  subscribedEvents: z.array(z.string()).min(1),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("automations:manage");
    const body = schema.parse(await req.json());
    const result = await registerAutomation(ctx.orgId, ctx.userId, body);
    return apiSuccess(
      { automation: result.automation, webhookSecret: result.secretShownOnce },
      201
    );
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
