import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/pro/paymongo";

export async function POST() {
  try {
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

    await cancelSubscription(org.paymongo_subscription_id as string);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({ subscription_status: "canceled" })
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
