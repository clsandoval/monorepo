"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface OrgData {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function GeneralSettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOrg() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      if (!membership) return;

      const { data: orgData } = await supabase
        .from("organizations")
        .select("id, name, logo_url")
        .eq("id", membership.organization_id)
        .single();

      if (orgData) {
        setOrg(orgData as OrgData);
        setOrgName(orgData.name);
        setLogoPreview(orgData.logo_url ?? null);
      }
    }

    loadOrg();
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!org) return;
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      let logoUrl = org.logo_url;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `logos/${org.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Logo upload failed: ${uploadError.message}`);
        }

        const { data: publicData } = supabase.storage
          .from("logos")
          .getPublicUrl(path);
        logoUrl = publicData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ name: orgName.trim(), logo_url: logoUrl })
        .eq("id", org.id);

      if (updateError) {
        throw new Error(`Save failed: ${updateError.message}`);
      }

      setOrg((prev) => (prev ? { ...prev, name: orgName.trim(), logo_url: logoUrl } : prev));
      setLogoFile(null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Organization Name */}
      <section className="space-y-4">
        <h2 className="font-display text-base font-semibold text-charcoal">
          Organization
        </h2>

        <div className="space-y-1.5">
          <label className="font-body text-sm font-medium text-charcoal" htmlFor="org-name">
            Organization name
          </label>
          <input
            id="org-name"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your organization name"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
          />
        </div>
      </section>

      {/* Logo Upload */}
      <section className="space-y-4">
        <h2 className="font-display text-base font-semibold text-charcoal">
          Logo
        </h2>

        <div className="space-y-3">
          {logoPreview && (
            <div className="flex items-center gap-3">
              <div className="relative size-16 overflow-hidden rounded-lg border border-divider bg-gray-50">
                <Image
                  src={logoPreview}
                  alt="Organization logo"
                  fill
                  className="object-contain p-1"
                  unoptimized={logoPreview.startsWith("data:")}
                />
              </div>
              <p className="font-body text-xs text-gray-secondary">Current logo</p>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal hover:bg-gray-50 transition-colors"
            >
              {logoPreview ? "Change logo" : "Upload logo"}
            </label>
            <p className="mt-1.5 font-body text-xs text-gray-secondary">
              PNG, JPG, WebP or SVG. Recommended: 200×200px or larger.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {success && (
        <p className="font-body text-sm font-medium text-emerald-600">
          Settings saved successfully.
        </p>
      )}
      {error && (
        <p className="font-body text-sm font-medium text-crimson">{error}</p>
      )}

      {/* Save */}
      <div>
        <Button
          onClick={handleSave}
          disabled={saving || !orgName.trim()}
          className="bg-sec-blue text-white hover:bg-sec-blue/90 font-body text-sm px-5 py-2 h-auto"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
