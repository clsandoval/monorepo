import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Use service role key for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const testSig = parts.find((p) => p.startsWith("te="))?.slice(3);
  const liveSig = parts.find((p) => p.startsWith("li="))?.slice(3);

  if (!timestamp) return false;

  const expectedSig = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  return expectedSig === testSig || expectedSig === liveSig;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("paymongo-signature") ?? "";

  if (!verifySignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const eventType = event.data?.attributes?.type;
  const eventData = event.data?.attributes?.data;

  switch (eventType) {
    case "subscription.invoice.paid": {
      const subscriptionId = eventData?.attributes?.subscription_id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({
            subscription_status: "active",
            current_period_ends_at: eventData?.attributes?.period_end,
          })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }

    case "subscription.invoice.payment_failed": {
      const subscriptionId = eventData?.attributes?.subscription_id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({ subscription_status: "past_due" })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }

    case "subscription.past_due":
    case "subscription.unpaid": {
      const subscriptionId = eventData?.id;
      if (subscriptionId) {
        await supabase
          .from("organizations")
          .update({ subscription_status: "unpaid" })
          .eq("paymongo_subscription_id", subscriptionId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
