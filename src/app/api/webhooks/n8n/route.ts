import { NextRequest, NextResponse } from "next/server";
import { createServerServiceClient } from "@/server/db/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyWebhookSignature } from "@/server/security/crypto";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rate = checkRateLimit(`webhook:n8n:${ip}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-atlas-signature") || req.headers.get("x-n8n-signature");
    const orgId = req.headers.get("x-atlas-org-id");

    const supabase = createServerServiceClient();

    // Verify automation credentials if orgId provided
    if (orgId && signature) {
      const { data: automation } = await supabase
        .from("automations")
        .select("secret_hash")
        .eq("org_id", orgId)
        .maybeSingle();

      if (automation?.secret_hash) {
        const valid = verifyWebhookSignature(rawBody, signature, automation.secret_hash);
        if (!valid) {
          return NextResponse.json({ error: "Invalid Webhook Signature" }, { status: 401 });
        }
      }
    }

    const payload = JSON.parse(rawBody);
    const { action, leadId, data } = payload;

    if (!action || !leadId) {
      return NextResponse.json({ error: "Missing action or leadId" }, { status: 400 });
    }

    const { data: lead } = await supabase
      .from("leads")
      .select("id, org_id")
      .eq("id", leadId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (action === "update_lead" && data) {
      await supabase.from("leads").update(data).eq("id", leadId);
      await emitEvent("lead.updated", lead.org_id, { leadId, updatedBy: "n8n" });
    } else if (action === "qualify_lead") {
      await supabase
        .from("leads")
        .update({ stage_id: "qualified", score: data?.score || 85 })
        .eq("id", leadId);
      await emitEvent("lead.qualified", lead.org_id, { leadId, source: "n8n" });
    }

    await writeAuditLog({
      orgId: lead.org_id,
      actorType: "n8n_webhook",
      action: `n8n.${action}`,
      entityType: "lead",
      entityId: leadId,
      summary: `n8n webhook executed action: ${action}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("n8n_webhook_error", error);
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
