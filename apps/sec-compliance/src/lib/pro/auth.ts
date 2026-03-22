import { createClient } from "@/lib/supabase/server";
import type { Organization, UserRole } from "./types";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  return (user.user_metadata?.role as UserRole) ?? "free";
}

export async function getUserOrg(): Promise<Organization | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  return org as Organization | null;
}

export async function requirePro(): Promise<{
  userId: string;
  org: Organization;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const role = (user.user_metadata?.role as UserRole) ?? "free";
  if (role !== "pro") throw new Error("Not a pro user");

  const org = await getUserOrg();
  if (!org) throw new Error("No organization found");

  return { userId: user.id, org };
}

export async function getOrgCorpCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("corporations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  return count ?? 0;
}
