import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { changePlan } from "@/lib/pro/paymongo";
import { PLAN_LIMITS, type Plan } from "@/lib/pro/types";

const PLAN_IDS: Record<Plan, string> = {
  solo: process.env.PAYMONGO_PLAN_SOLO!,
  practice: process.env.PAYMONGO_PLAN_PRACTICE!,
  firm: process.env.PAYMONGO_PLAN_FIRM!,
};

export async function POST(req: NextRequest) {
  try {
    const { newPlan } = (await req.json()) as { newPlan: Plan };

    if (!newPlan) {
      return NextResponse.json({ error: "Missing newPlan" }, { status: 400 });
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

    if (!org.paymongo_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Check if corp count exceeds new plan limit (block downgrade)
    const { count: corpCount } = await supabase
      .from("corporations")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", org.id);

    const newLimit = PLAN_LIMITS[newPlan];
    if ((corpCount ?? 0) > newLimit) {
      return NextResponse.json(
        {
          error: `Cannot downgrade: you have ${corpCount} corporations but the ${newPlan} plan only allows ${newLimit}.`,
        },
        { status: 422 }
      );
    }

    await changePlan(org.paymongo_subscription_id as string, PLAN_IDS[newPlan]);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        plan: newPlan,
        corp_limit: newLimit,
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
