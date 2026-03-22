"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface WizardData {
  corpType: "stock" | "non_stock" | "opc";
  incorporationYear: number;
  reBracket: string;
  mc28Compliant: boolean;
  filedReports: Array<{
    reportType: string;
    year: number;
    status: string;
  }>;
  suspensionDate: string | null;
  revocationDate: string | null;
  hasSuspension?: boolean;
  hasRevocation?: boolean;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const dataParam = searchParams.get("data");

  useEffect(() => {
    // Store wizard data in sessionStorage so it survives OAuth redirect
    if (dataParam) {
      sessionStorage.setItem("sec_wizard_data", dataParam);
    }
  }, [dataParam]);

  async function saveCorporationData(supabase: ReturnType<typeof createClient>, userId: string) {
    const stored = sessionStorage.getItem("sec_wizard_data");
    if (!stored) return;

    try {
      const wizardData = JSON.parse(atob(stored)) as WizardData;

      const { data: corp, error: corpError } = await supabase
        .from("corporations")
        .insert({
          user_id: userId,
          corp_type: wizardData.corpType,
          incorporation_year: wizardData.incorporationYear,
          re_bracket: wizardData.reBracket,
          mc28_compliant: wizardData.mc28Compliant,
          suspension_date: wizardData.suspensionDate,
          revocation_date: wizardData.revocationDate,
        })
        .select("id")
        .single();

      if (corpError || !corp) return;

      // Insert filing records
      if (wizardData.filedReports && wizardData.filedReports.length > 0) {
        await supabase.from("filing_records").insert(
          wizardData.filedReports.map((report) => ({
            corporation_id: corp.id,
            report_type: report.reportType,
            year: report.year,
            status: report.status,
          }))
        );
      }

      sessionStorage.removeItem("sec_wizard_data");
    } catch {
      // Non-fatal — user is logged in, data just wasn't saved
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await saveCorporationData(supabase, data.user.id);
    }

    router.push("/remediation");
  }

  async function handleGoogleSignup() {
    setOauthLoading(true);
    setError(null);

    const supabase = createClient();

    // Pass wizard data as `next` so callback can redirect with it available
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/remediation`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
    // On success, browser is redirected — no further action needed
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold text-charcoal">
            Get your remediation plan
          </h1>
          <p className="font-body text-sm text-gray-secondary">
            Create a free account to access your personalized SEC compliance
            roadmap.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-divider bg-white p-8 shadow-sm space-y-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-crimson/20 bg-crimson/5 px-4 py-3">
              <p className="font-body text-sm text-crimson">{error}</p>
            </div>
          )}

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 gap-3 font-body text-sm border-gray-300 text-charcoal hover:bg-gray-50"
            onClick={handleGoogleSignup}
            disabled={oauthLoading || loading}
          >
            <GoogleIcon />
            {oauthLoading ? "Redirecting..." : "Continue with Google"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-divider" />
            <span className="font-body text-xs text-gray-muted">or</span>
            <div className="flex-1 border-t border-divider" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-body text-sm text-charcoal">
                Email address
              </Label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-gray-muted focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-body text-sm text-charcoal">
                Password
              </Label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-gray-muted focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="font-body text-sm text-charcoal">
                Confirm password
              </Label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-body text-sm text-charcoal placeholder:text-gray-muted focus:border-sec-blue focus:outline-none focus:ring-2 focus:ring-sec-blue/20"
                placeholder="Repeat your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full h-10 bg-sec-blue text-white hover:bg-sec-blue/90 font-body text-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center font-body text-sm text-gray-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sec-blue hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sec-blue border-t-transparent" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
