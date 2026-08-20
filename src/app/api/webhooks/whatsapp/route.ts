import { NextRequest, NextResponse } from "next/server";
import { createServerServiceClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { ingestInboundMessage } from "@/server/services/conversation-engine";
import { createMessagingProvider } from "@/server/integrations/providers";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rate = checkRateLimit(`webhook:whatsapp:${ip}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (appSecret && signature) {
      const { createHmac, timingSafeEqual } = await import("crypto");
      const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
      try {
        if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
          return NextResponse.json({ success: false }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ success: false }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const phoneNumberId = payload?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    const supabase = createServerServiceClient();
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, org_id, provider, credentials_ciphertext, config")
      .eq("type", "whatsapp")
      .eq("status", "connected")
      .contains("config", { phoneNumberId })
      .maybeSingle();

    let orgId = integration?.org_id;
    let integrationId = integration?.id;

    if (!orgId) {
      const { data: fallback } = await supabase
        .from("integrations")
        .select("id, org_id")
        .eq("type", "whatsapp")
        .eq("status", "connected")
        .limit(1)
        .maybeSingle();
      orgId = fallback?.org_id;
      integrationId = fallback?.id;
    }

    if (!orgId) {
      logger.error("whatsapp_webhook_no_org");
      return NextResponse.json({ success: true });
    }

    const provider = createMessagingProvider("whatsapp_cloud", {});
    const normalized = await provider.parseInboundWebhook(payload, req.headers);
    if (!normalized) {
      return NextResponse.json({ success: true });
    }

    await ingestInboundMessage({
      orgId,
      integrationId,
      message: normalized,
      source: "whatsapp",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("whatsapp_webhook_error", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const { searchParams } = new URL(req.url);
  if (searchParams.get("hub.verify_token") === verifyToken) {
    return new NextResponse(searchParams.get("hub.challenge") || "", { status: 200 });
  }
  return NextResponse.json({ success: false }, { status: 403 });
}
