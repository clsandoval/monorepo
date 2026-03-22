import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/pro/auth";
import { TrialBanner } from "@/components/pro/trial-banner";
import { ProNav } from "@/components/pro/pro-nav";
import { SettingsNav } from "./settings-nav";

export default async function SettingsLayout({
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-charcoal mb-6">Settings</h1>
        <SettingsNav />
        {children}
      </div>
    </>
  );
}
