# Commercialization Milestone — Brief

**Status:** brief only. Do NOT plan or execute until the launch-blocker milestone (12 phases)
is complete. **Recorded:** 2026-08-01, at owner request.

## Intent

The launch-blocker milestone makes the product *defensible* — a lawyer would trust it and could
use it. This milestone makes it *sellable* — a lawyer can pay for it, a firm can be onboarded,
and the business can operate without the owner in the loop.

These are genuinely two different problems and only the first is currently in flight. Nothing in
the twelve launch-blocker phases charges anyone, emails anyone, or gets a second lawyer into a firm.

**Verified starting position:** there is zero payment code in `apps/inheritance`. Every apparent
"subscription" match is `supabase.auth.onAuthStateChange(...).unsubscribe()`. There is an
`OrgPlan` type and a `seat_limit: number` field in `types/index.ts:700` and nothing that charges
or enforces anything.

## The decision that gates everything: this app has no server

`apps/inheritance/frontend/` is a static container served by nginx, talking straight to Supabase.
There is no `frontend/supabase/functions/` directory. Today that is a genuine feature — the
estate never leaves the browser, which is a real privacy story for a lawyer holding a client's
asset schedule, and the vision audit rated it as a reason to reject the Sheets add-on.

**A payment webhook cannot run in a browser.** PayMongo must POST somewhere that can verify a
signature and write to the database with elevated privilege. So commercialization *forces* the
server decision that the Sheets add-on was deferred for.

Two consequences the owner should decide on deliberately, not discover:

1. **Use Supabase Edge Functions**, not a second deployment. It is the only option that adds no
   new hosting surface, no new domain, and no new thing to keep alive with scarce attention.
2. **Once a compute surface exists, the deferred Google Sheets output add-on becomes materially
   cheaper** — it was deferred *because* it mandated a server. Revisit it after billing ships,
   not before, and only if a lawyer has actually asked.

Keep the engine in the browser. The server exists for money and mail, never for law.

## The pricing decision, and how the deletion milestone changed it

The deletion milestone removed seats, roles, and invites. That makes **per-seat billing
expensive again** — it would require rebuilding the collaboration layer that was just deleted for
good reasons.

| Model | Fit | Cost after the deletion |
|---|---|---|
| **Per-firm flat subscription** | A firm is a flat set of equal members — exactly the audit's finding | **Cheapest.** Needs no seat accounting at all |
| Per-seat | Contradicts the deletion; enterprise concept in a five-person office | Expensive — rebuild invites, roles, seat enforcement |
| Per-case / metered | Matches the artifact (one estate = one deed + one 1801) and is legible to a lawyer who bills per matter | Moderate; needs metering and a quota gate |

**Recommendation: per-firm flat, with a per-case metered tier only if usage data later justifies
it.** It is the only model consistent with the product identity already chosen, and it lets the
`seat_limit` field and `OrgPlan` type be deleted rather than implemented.

If the owner wants per-seat, that is a legitimate choice — but it means partially reversing
cut(02), and that reversal should be an explicit decision recorded here, not a quiet regrowth.

## Deliverables, ranked

### 1. Billing, end to end — PayMongo
PayMongo, not Stripe: it is the Philippine-native processor and supports GCash, Maya, InstaPay
and local cards, which is how a Philippine small firm actually pays.

**Reuse, do not rebuild.** `projects/legal-interest-engine` already has a working integration by
the same owner for the same buyer:
- `app/api/webhooks/paymongo/route.ts` — signature verification via `verifyWebhookSignature`,
  `payment.paid` handling
- `app/pricing/`, `app/pricing/checkout/`, `app/pricing/success/`
Port the signature-verification and event-handling logic; the Next.js route shape does not
transfer to Edge Functions, the logic does.

Scope: plans table, checkout, webhook (paid / failed / subscription cancelled), an entitlement
check the app reads, a grace period, and an invoice or receipt the firm can expense. Webhook
signature verification is a security boundary — it gets a gate.

### 2. Transactional email
There is no email provider at all; only Supabase's built-in auth mail. Needed for receipts,
dunning, and invites. One provider, one templated sender, no marketing automation.

### 3. Repair onboarding — it is currently broken
Both signup paths create the organisation *before* navigating to `/onboarding`
(`auth.tsx:85-86`, `auth/callback.tsx:31-33`), and `onboarding.tsx:39` redirects away the moment
an org exists. **The firm-name and attorney-profile steps therefore never run, and production
firms stay named "My Firm."** Also `callback.tsx` has no `.catch` around `createOrganization`,
so a failure hangs the confirmation spinner forever. Nobody pays for a product that cannot learn
their firm's name.

### 4. Get a second lawyer into a firm
The invite flow was deleted in cut(02) — correctly, since emails never sent and the token was
never surfaced. But a paying firm with two lawyers currently has no path. Rebuild the **minimum**:
generate a link, show it, let it be copied, let it be accepted. No roles, no seats, no email
required. This is the one piece of the collaboration layer that has to come back.

### 5. Legal surface
Terms of Service, Privacy Policy, and a Data Processing Agreement. This product stores named
families' asset schedules and dates of death — personal and sensitive information under the
**Philippine Data Privacy Act (RA 10173)**. Determine whether NPC registration is required for
this processing volume; that is a question for the lawyer collaborator, not an agent.

### 6. Account deletion and data export
Same statutory driver as above, and a precondition for any firm's own client-confidentiality
obligations. A firm must be able to leave with its data and be forgotten.

### 7. Error reporting
No Sentry equivalent exists. Today the owner would learn about a production break from a phone
call. One provider, errors only, no session replay of screens containing client assets.

### 8. Revisit the SEO deletion — explicitly
The deletion milestone removed the six SEO calculator pages, the blog and the sitemap, on the
audit's reasoning that they *"acquire heirs, who are not users."* That is correct **if**
distribution runs through the collaborator's professional network.

It is wrong if paid or organic search is meant to be the growth channel. Once there is a price,
acquisition cost becomes a real number and this stops being a taste question. **Decide it with
the pricing model, and record the decision** — do not let SEO quietly regrow one page at a time.

## Explicitly out of scope

Analytics dashboards, referral programmes, coupons and promo codes, multi-currency, annual-vs-
monthly experimentation, in-app chat support, a mobile app, and any CRM. A 50–200 lawyer product
sold through a professional network does not need a growth stack, and an idle loop will build one.

## Success criteria (what must be TRUE)

1. A firm can subscribe with GCash or a card and immediately gain access, verified end to end
   against PayMongo's test environment.
2. A failed or cancelled payment revokes access after a defined grace period, and this is proven
   by a test, not by inspection.
3. The webhook rejects an invalid signature; a blocking gate proves it.
4. A new firm completes onboarding and its real firm name appears on a generated PDF letterhead.
5. A second lawyer joins an existing firm through a link, without email infrastructure.
6. A firm can export all of its data and delete its account.
7. Terms, Privacy and the DPA are reachable from the app, and the RA 10173 registration question
   has a recorded answer from the lawyer.
8. A deliberate production error appears in the error reporter within one minute.
9. The compute surface added for billing runs *only* billing and mail. A gate proves no
   succession or estate-tax computation executes server-side — the engine stays in the browser.

## Sequencing note

This milestone should not start until the launch-blocker run reports launchable. Charging for a
product that cannot yet produce a deed clause or a filed return is the wrong order, and a paying
user is a far more expensive audience to disappoint than none at all.
