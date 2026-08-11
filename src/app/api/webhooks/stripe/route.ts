import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerServiceClient } from "@/lib/supabase";
import { logger } from "@/lib/logger";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      logger.warn("Stripe webhook received without valid signature or secret");
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      logger.error("Stripe Webhook Signature Verification Failed", err);
      return NextResponse.json({ error: "Invalid Webhook Signature" }, { status: 400 });
    }

    const supabase = createServerServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info("Stripe Checkout Completed", { sessionId: session.id, customer: session.customer });
        
        // Update subscription / org plan status in Supabase
        if (session.client_reference_id) {
          await supabase
            .from("organizations")
            .update({ plan: "Pro", updated_at: new Date().toISOString() })
            .eq("id", session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info("Stripe Subscription Canceled", { subscriptionId: subscription.id });
        break;
      }
      default:
        logger.info(`Unhandled Stripe Event Type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    logger.error("Stripe Webhook Handler Error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
