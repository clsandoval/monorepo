# Domains, DNS, and SSL — Daimon SaaS

> Aspect: 6.1 — Vercel deployment config, env vars, build commands, domains
> Written: 2026-03-13
> Related: [infrastructure.md](./infrastructure.md), [environment.md](./environment.md)

---

## Overview

| Domain | What It Points To | Purpose |
|--------|------------------|---------|
| `daimon.ai` | Vercel (production) | Primary website, landing page, marketing |
| `www.daimon.ai` | Redirect → `daimon.ai` | www-to-apex redirect |
| `app.daimon.ai` | Vercel (production) — NOT used | Reserved; not used. App lives at `daimon.ai/dashboard`. |
| `*.daimon.ai` | Vercel (preview deployments) | Branch preview deployments (e.g., `feature-x.daimon.ai`) |
| `bot.daimon.ai` | NOT used | The bot does not have a public HTTP endpoint. Fly.io health checks are internal. |

**Decision: Single domain, no app subdomain.** The marketing site and dashboard are both at `daimon.ai`. This simplifies cookie scoping, CORS, and Auth redirect configuration. Dashboard lives at `/dashboard/*`.

---

## Section 1: DNS Configuration

### 1.1 Required DNS Records

Set these DNS records at your domain registrar or DNS provider (e.g., Cloudflare, Route53, Namecheap):

| Type | Name | Value | TTL | Notes |
|------|------|-------|-----|-------|
| A | `@` (apex) | `76.76.21.21` | 3600 | Vercel's anycast IP for apex domains |
| AAAA | `@` (apex) | `2606:4700:4700::1111` | 3600 | Vercel IPv6 anycast |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 | www subdomain → Vercel CNAME |
| CNAME | `*` | `cname.vercel-dns.com` | 3600 | Wildcard for preview deployments |

**Note on apex A record:** Vercel provides the IP `76.76.21.21` as their Anycast IP for apex (naked) domains. Do NOT use a CNAME for the apex — CNAME at apex (`@`) is not standards-compliant (though some providers like Cloudflare support CNAME flattening). Use the A record for maximum compatibility.

**If using Cloudflare DNS (recommended):**
- Enable "Proxied" (orange cloud) on the apex A record for DDoS protection and Cloudflare CDN
- Set SSL/TLS mode to "Full (Strict)" to ensure end-to-end encryption
- Enable "Always Use HTTPS" rule
- Enable "Automatic HTTPS Rewrites"
- Do NOT proxy the wildcard `*` CNAME if Vercel needs to issue SSL certificates via ACME challenge — set it to "DNS only" (gray cloud)

### 1.2 Domain Setup in Vercel Dashboard

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add domain: `daimon.ai`
3. Vercel shows the required DNS records — confirm they match Section 1.1 above
4. Add domain: `www.daimon.ai`
5. Set `www.daimon.ai` to redirect to `daimon.ai` (Vercel handles this automatically when you add both)
6. Vercel automatically issues and renews SSL certificates via Let's Encrypt

**Branch Domains (Preview):**
- Vercel automatically creates preview URLs like `daimon-git-feature-x-myorg.vercel.app`
- For branded branch domains (`feature-x.daimon.ai`), configure in Vercel Dashboard → Project → Settings → Domains → Branch domains
- Requires the wildcard DNS record (`*.daimon.ai → cname.vercel-dns.com`)

---

## Section 2: SSL / TLS

Vercel provides automatic SSL certificate provisioning and renewal via Let's Encrypt. No manual configuration is needed.

| Property | Value |
|----------|-------|
| Certificate Authority | Let's Encrypt (automatic) |
| Certificate type | SAN (Subject Alternative Names) covering `daimon.ai` and `www.daimon.ai` |
| Auto-renewal | Yes — Vercel renews 30 days before expiry |
| TLS version | TLS 1.2 minimum, TLS 1.3 preferred |
| HSTS | Enabled via `next.config.ts` security headers (see [infrastructure.md Section 1.4](./infrastructure.md#14-nextconfigts)) |
| Certificate pinning | Not required (Vercel manages cert rotation) |

**If using Cloudflare:**
- Cloudflare issues its own certificate for the browser → Cloudflare edge leg
- Vercel issues a certificate for the Cloudflare edge → Vercel origin leg
- Set Cloudflare SSL mode to "Full (Strict)" to validate both legs
- Do NOT use "Flexible" — it sends traffic HTTP to Vercel which may break Auth cookies

---

## Section 3: Routing

### 3.1 Next.js App Router Route Structure

All routes are in the `app/` directory. Route groups with parentheses `(group)` are used for shared layouts without affecting the URL.

| URL Pattern | File Path | Description |
|------------|-----------|-------------|
| `/` | `app/page.tsx` | Landing page |
| `/login` | `app/(auth)/login/page.tsx` | Login form |
| `/signup` | `app/(auth)/signup/page.tsx` | Signup form |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Password reset request |
| `/reset-password/confirm` | `app/(auth)/reset-password/confirm/page.tsx` | Password reset confirmation |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Dashboard home |
| `/dashboard/integrations` | `app/(dashboard)/dashboard/integrations/page.tsx` | Integrations |
| `/dashboard/billing` | `app/(dashboard)/dashboard/billing/page.tsx` | Billing & API keys |
| `/dashboard/settings` | `app/(dashboard)/dashboard/settings/page.tsx` | Settings |
| `/admin` | `app/(admin)/admin/page.tsx` | Admin tenant list |
| `/admin/tenants/[id]` | `app/(admin)/admin/tenants/[id]/page.tsx` | Admin tenant detail |
| `/admin/audit` | `app/(admin)/admin/audit/page.tsx` | Admin audit log |
| `/docs` | `app/(docs)/docs/page.tsx` | Docs landing / redirect to Quick Start |
| `/docs/quickstart` | `app/(docs)/docs/quickstart/page.tsx` | Quick Start guide |
| `/docs/tools` | `app/(docs)/docs/tools/page.tsx` | Tool reference index |
| `/docs/tools/[category]` | `app/(docs)/docs/tools/[category]/page.tsx` | Tool reference by category |
| `/docs/billing` | `app/(docs)/docs/billing/page.tsx` | Billing & plans docs |
| `/docs/faq` | `app/(docs)/docs/faq/page.tsx` | FAQ |
| `/api/auth/callback` | `app/api/auth/callback/route.ts` | Supabase Auth PKCE callback |
| `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | Stripe webhook receiver |
| `/api/stripe/checkout` | `app/api/stripe/checkout/route.ts` | Create Checkout Session |
| `/api/stripe/portal` | `app/api/stripe/portal/route.ts` | Create Customer Portal session |
| `/api/integrations/oauth/start` | `app/api/integrations/oauth/start/route.ts` | OAuth authorization redirect |
| `/api/integrations/oauth/callback` | `app/api/integrations/oauth/callback/route.ts` | OAuth token exchange callback |
| `/api/integrations/validate-discord` | `app/api/integrations/validate-discord/route.ts` | Validate Discord bot token |
| `/api/integrations/validate-toggl` | `app/api/integrations/validate-toggl/route.ts` | Validate Toggl API key |
| `/api/connections` | `app/api/connections/route.ts` | GET/POST discord connections |
| `/api/connections/[id]` | `app/api/connections/[id]/route.ts` | PATCH/DELETE discord connection |
| `/api/connections/[id]/reconnect` | `app/api/connections/[id]/reconnect/route.ts` | Force reconnect |
| `/api/admin/tenants` | `app/api/admin/tenants/route.ts` | Admin: list tenants |
| `/api/admin/tenants/[id]` | `app/api/admin/tenants/[id]/route.ts` | Admin: tenant CRUD |
| `/api/admin/tenants/[id]/suspend` | `app/api/admin/tenants/[id]/suspend/route.ts` | Admin: suspend/unsuspend |
| `/api/admin/tenants/[id]/plan` | `app/api/admin/tenants/[id]/plan/route.ts` | Admin: plan override |
| `/api/admin/tenants/[id]/impersonate` | `app/api/admin/tenants/[id]/impersonate/route.ts` | Admin: start impersonation |
| `/api/admin/impersonation/end` | `app/api/admin/impersonation/end/route.ts` | Admin: end impersonation |
| `/api/admin/audit` | `app/api/admin/audit/route.ts` | Admin: audit log |

### 3.2 Redirect Rules

| From | To | Type | Trigger |
|------|----|------|---------|
| `www.daimon.ai/*` | `https://daimon.ai/*` | 301 Permanent | Vercel domain settings |
| `http://daimon.ai/*` | `https://daimon.ai/*` | 301 Permanent | Vercel (auto) + HSTS |
| `/pricing` | `/#pricing` | 302 Temporary | `next.config.ts` redirect |
| `/dashboard` (unauthenticated) | `/login?next=/dashboard` | 302 | Middleware |
| `/admin` (unauthenticated) | `/login` | 302 | Middleware |
| `/admin` (authenticated, non-admin) | `/dashboard` | 302 | Middleware |
| `/docs` (exact match) | `/docs/quickstart` | 307 | `app/(docs)/docs/page.tsx` |
| `/?deleted=1` | (shows landing with "workspace deleted" banner) | None | Client-side param handling |
| `/?passwordUpdated=true` | (shows login with "password updated" banner) | None | Client-side param handling |

### 3.3 CORS Policy

API routes in Next.js app only need CORS configured if they are called from a different origin (e.g., a mobile app or third-party). For the Daimon website, all API routes are called from the same origin (`daimon.ai`). No explicit CORS configuration is needed at launch.

**Exception: Supabase Edge Functions** — these are at a different origin (`*.supabase.co/functions/v1/*`). The browser calls them from `daimon.ai`. Add CORS headers to each Edge Function:

```typescript
// Edge Function response headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://daimon.ai',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS preflight
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

**For preview deployments:** Set `Access-Control-Allow-Origin` to `*` or add a check for `*.vercel.app` origins. Use `*` for development; tighten for production.

---

## Section 4: Cookies

Supabase Auth uses HTTP-only cookies managed by `@supabase/ssr`. These cookies are scoped to the domain.

| Cookie Name | Scope | SameSite | Secure | TTL | Purpose |
|------------|-------|----------|--------|-----|---------|
| `sb-<project-ref>-auth-token` | `daimon.ai` | Lax | Yes (HTTPS only) | Session (1 hour) | Supabase Auth access token JWT |
| `sb-<project-ref>-auth-token-code-verifier` | `daimon.ai` | Lax | Yes | 5 minutes | PKCE code verifier for auth callback |
| `oauth_state` | `daimon.ai` | Lax | Yes | 10 minutes | CSRF state for OAuth flows |
| `oauth_service` | `daimon.ai` | Lax | Yes | 10 minutes | Which OAuth service is in-flight |
| `oauth_tenant_id` | `daimon.ai` | Lax | Yes | 10 minutes | Tenant ID for OAuth callback |

**`SameSite=Lax`**: This is the correct value for OAuth callbacks. `SameSite=Strict` would prevent the auth cookies from being sent on the redirect back from the OAuth provider (a top-level navigation from a different domain). `SameSite=Lax` allows cookies to be sent on top-level GET navigations (redirects) but not on cross-site form POST or AJAX.

---

## Section 5: Supabase Auth Redirect URLs

Supabase Auth must be configured to allow redirects to the correct URLs. Set in Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://daimon.ai` |
| Additional Redirect URLs | `https://daimon.ai/**` |
| Additional Redirect URLs | `https://*.vercel.app/**` |
| Additional Redirect URLs | `http://localhost:3000/**` |

The `**` glob matches any path. This allows `/api/auth/callback` and `/reset-password/confirm` to be valid redirect targets.

---

## Section 6: Preview Deployment Considerations

Vercel creates a unique URL for every deployment: `daimon-<hash>.vercel.app`. For branch deployments, it's `daimon-git-<branch>-<org>.vercel.app`.

**OAuth providers (GitHub, Google, Linear)**: Each provider requires explicit authorized redirect URIs. Preview deployment URLs are dynamic — they cannot all be pre-registered. Approaches:

1. **Separate OAuth apps for development**: Register a development OAuth app with redirect URI `http://localhost:3000/api/integrations/oauth/callback`. Preview deployments use the same dev app (set `NEXT_PUBLIC_APP_URL` to the preview URL in Vercel's preview environment). This requires each preview deployment to know its own URL.

2. **Vercel System Environment Variables**: Set `NEXT_PUBLIC_APP_URL` to `https://$VERCEL_URL` in preview environment. Vercel injects `VERCEL_URL` automatically as the deployment's unique URL (e.g., `daimon-abc123.vercel.app`).

   In `lib/env.ts`, handle the fallback:
   ```typescript
   // For preview deployments, NEXT_PUBLIC_APP_URL may not be set
   // Fall back to VERCEL_URL (server-side only)
   export const getAppUrl = (): string => {
     if (process.env.NEXT_PUBLIC_APP_URL) {
       return process.env.NEXT_PUBLIC_APP_URL
     }
     if (process.env.VERCEL_URL) {
       return `https://${process.env.VERCEL_URL}`
     }
     return 'http://localhost:3000'
   }
   ```

3. **GitHub OAuth wildcard**: GitHub OAuth Apps can have multiple callback URLs — register `https://*.vercel.app/api/integrations/oauth/callback` using a wildcard (GitHub supports this). Use this for GitHub only.

**Recommended approach for launch:** Use separate OAuth apps for production vs. development. Only register `https://daimon.ai/api/integrations/oauth/callback` in production apps. Dev/preview uses dev apps with localhost redirect URI.

---

## Section 7: Custom Email Domain (Post-Launch)

Supabase sends transactional emails (signup confirmation, password reset) from a Supabase SMTP server by default. For better deliverability and branding, configure a custom SMTP sender:

| Setting | Value |
|---------|-------|
| Sender Name | `Daimon` |
| Sender Email | `noreply@daimon.ai` |
| SMTP Host | `smtp.resend.com` |
| SMTP Port | `587` (STARTTLS) |
| SMTP User | `resend` |
| SMTP Password | Resend API key (from Resend dashboard → API Keys) |

**Required DNS records for email authentication:**

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `@` | `v=spf1 include:amazonses.com ~all` | SPF — authorizes Resend (SES-based) to send on behalf of `daimon.ai` |
| CNAME | `resend._domainkey` | `resend._domainkey.resend.com` | DKIM — Resend's cryptographic email signature |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@daimon.ai` | DMARC — policy for handling SPF/DKIM failures |

These DNS records are required before switching Supabase SMTP to Resend. Configure them in your DNS provider when setting up Resend (resend.com → Domains → Add Domain → `daimon.ai`). Resend's dashboard will display the exact record values to copy.
