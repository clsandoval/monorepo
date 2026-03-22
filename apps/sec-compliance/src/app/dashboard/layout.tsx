import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/pro/auth";
import { TrialBanner } from "@/components/pro/trial-banner";
import { ProNav } from "@/components/pro/pro-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getUserOrg();
  if (!org) redirect("/pro");

  return (
    <>
      <TrialBanner org={org} />
      <ProNav />
      <div className="flex-1">{children}</div>
    </>
  );
}
