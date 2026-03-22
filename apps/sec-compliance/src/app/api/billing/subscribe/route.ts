import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCustomer, createSubscription } from "@/lib/pro/paymongo";
import { PLAN_LIMITS, type Plan } from "@/lib/pro/types";

const PLAN_IDS: Record<Plan, string> = {
  solo: process.env.PAYMONGO_PLAN_SOLO!,
  practice: process.env.PAYMONGO_PLAN_PRACTICE!,
  firm: process.env.PAYMONGO_PLAN_FIRM!,
};

export async function POST(req: NextRequest) {
  try {
    const { plan, paymentMethodId } = (await req.json()) as {
      plan: Plan;
      paymentMethodId: string;
    };

    if (!plan || !paymentMethodId) {
      return NextResponse.json({ error: "Missing plan or paymentMethodId" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No organization" }, { status: 403 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", membership.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create PayMongo customer if org doesn't have one
    let customerId = org.paymongo_customer_id as string | null;
    if (!customerId) {
      const customerRes = await createCustomer(user.email!, user.user_metadata?.full_name ?? user.email!);
      customerId = customerRes.data.id as string;
    }

    const planId = PLAN_IDS[plan];
    const subscriptionRes = await createSubscription(customerId, planId, paymentMethodId);
    const subscriptionId = subscriptionRes.data.id as string;

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        paymongo_customer_id: customerId,
        paymongo_subscription_id: subscriptionId,
        subscription_status: "active",
        plan,
        corp_limit: PLAN_LIMITS[plan],
      })
      .eq("id", org.id);

    if (updateError) {
      throw new Error(`Failed to update org: ${updateError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
