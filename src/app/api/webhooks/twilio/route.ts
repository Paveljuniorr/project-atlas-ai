import { NextRequest, NextResponse } from "next/server";
import { createServerServiceClient } from "@/lib/supabase";
import { twilioWebhookSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/security";
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

    const rawFrom = params.get("From");
    const rawBody = params.get("Body");
    const messageSid = params.get("MessageSid");

    const validated = twilioWebhookSchema.parse({ From: rawFrom, Body: rawBody, MessageSid: messageSid });

    const channel = validated.From.startsWith("whatsapp:") ? "whatsapp" : "sms";
    const phoneNormalized = validated.From.replace("whatsapp:", "").trim();
    const bodySanitized = sanitizeHtml(validated.Body);

    const supabase = createServerServiceClient();

    // Multitenant mapping by org lookup
    const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
    const orgId = orgs?.[0]?.id;

    if (!orgId) {
      logger.error("Twilio webhook error: No active organization found");
      return NextResponse.json({ error: "Organization Configuration Missing" }, { status: 500 });
    }

    // 1. Find or create lead
    let { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("org_id", orgId)
      .eq("phone", phoneNormalized)
      .maybeSingle();

    if (!lead) {
      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          org_id: orgId,
          phone: phoneNormalized,
          source: channel,
          stage_id: "new",
        })
        .select("id")
        .single();
      lead = newLead;
    }

    // 2. Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("org_id", orgId)
      .eq("lead_id", lead?.id)
      .eq("channel", channel)
      .maybeSingle();

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          org_id: orgId,
          lead_id: lead?.id,
          channel,
          participant_address: phoneNormalized,
        })
        .select("id")
        .single();
      conversation = newConversation;
    }

    // 3. Insert incoming message
    await supabase.from("messages").insert({
      org_id: orgId,
      conversation_id: conversation?.id,
      lead_id: lead?.id,
      direction: "inbound",
      status: "delivered",
      body: bodySanitized,
      sender_type: "lead",
      external_message_id: validated.MessageSid || null,
    });

    // 4. Update unread count and preview
    await supabase.rpc('increment_unread_count', { conv_id: conversation?.id });
    await supabase
      .from("conversations")
      .update({ last_message_preview: bodySanitized.substring(0, 100) })
      .eq("id", conversation?.id)
      .eq("org_id", orgId);

    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    logger.error("Twilio Webhook Error", error);
    return NextResponse.json({ error: "Invalid Request Payload" }, { status: 400 });
  }
}
