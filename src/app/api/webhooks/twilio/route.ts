import { NextRequest, NextResponse } from "next/server";
import { createServerServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Twilio sends data as form-urlencoded
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    const from = params.get("From"); // e.g., "whatsapp:+1234567890" or "+1234567890"
    const body = params.get("Body");
    const messageSid = params.get("MessageSid");
    
    if (!from || !body) {
      return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
    }

    const channel = from.startsWith("whatsapp:") ? "whatsapp" : "sms";
    const phoneNormalized = from.replace("whatsapp:", "").trim();

    const supabase = createServerServiceClient();

    // In a multi-tenant setup, you'd find the org based on the To number (the Twilio number).
    // For MVP, we assume a single org, or fetch the first one.
    const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
    const orgId = orgs?.[0]?.id;

    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 500 });
    }

    // 1. Find or create the lead by phone
    let { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("org_id", orgId)
      .eq("phone", phoneNormalized)
      .single();

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

    // 2. Find or create the conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("org_id", orgId)
      .eq("lead_id", lead?.id)
      .eq("channel", channel)
      .single();

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

    // 3. Insert the message
    await supabase.from("messages").insert({
      org_id: orgId,
      conversation_id: conversation?.id,
      lead_id: lead?.id,
      direction: "inbound",
      status: "delivered",
      body,
      sender_type: "lead",
      external_message_id: messageSid,
    });

    // 4. Update conversation unread count and preview
    await supabase.rpc('increment_unread_count', { conv_id: conversation?.id });
    await supabase
      .from("conversations")
      .update({ last_message_preview: body.substring(0, 100) })
      .eq("id", conversation?.id);

    // Respond to Twilio with empty TwiML to acknowledge receipt
    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
