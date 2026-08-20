import { NextRequest, NextResponse } from "next/server";
import { createServerServiceClient } from "@/lib/supabase";
import { twilioWebhookSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { ingestInboundMessage } from "@/server/services/conversation-engine";
import { createMessagingProvider } from "@/server/integrations/providers";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rate = checkRateLimit(`webhook:twilio:${ip}`, 60, 60000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const textData = await req.text();
    const params = new URLSearchParams(textData);
    const validated = twilioWebhookSchema.parse({
      From: params.get("From"),
      Body: params.get("Body"),
      MessageSid: params.get("MessageSid"),
    });

    const supabase = createServerServiceClient();

    const toNumber = params.get("To")?.replace("whatsapp:", "") || "";
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, org_id, config")
      .eq("type", "whatsapp")
      .eq("status", "connected")
      .maybeSingle();

    const orgId = integration?.org_id;
    if (!orgId) {
      const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
      if (!orgs?.[0]?.id) {
        return NextResponse.json({ error: "Organization Configuration Missing" }, { status: 500 });
      }
    }

    const resolvedOrgId = orgId || (await supabase.from("organizations").select("id").limit(1).single()).data?.id;
    if (!resolvedOrgId) {
      return NextResponse.json({ error: "Organization Configuration Missing" }, { status: 500 });
    }

    const provider = createMessagingProvider("twilio", {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      fromNumber: toNumber,
    });

    const normalized = await provider.parseInboundWebhook(
      Object.fromEntries(params.entries()),
      req.headers
    );

    if (!normalized) {
      return new NextResponse("<Response></Response>", { status: 200, headers: { "Content-Type": "text/xml" } });
    }

    await ingestInboundMessage({
      orgId: resolvedOrgId,
      integrationId: integration?.id,
      message: normalized,
      source: "twilio",
    });

    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    logger.error("Twilio Webhook Error", error);
    return NextResponse.json({ error: "Invalid Request Payload" }, { status: 400 });
  }
}
