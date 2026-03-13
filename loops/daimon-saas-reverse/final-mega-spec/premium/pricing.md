# Pricing — Daimon SaaS

> Aspect: 5.1 (Stripe integration — pricing details)
> Written: 2026-03-13
> Related: [tiers.md](./tiers.md), [features-by-tier.md](./features-by-tier.md), [../integrations/stripe.md](../integrations/stripe.md)

---

## Price Points

| Plan | Monthly | Annual (total) | Annual (per month equivalent) | Annual savings |
|------|---------|---------------|------------------------------|---------------|
| Free | $0 | $0 | $0 | — |
| Starter | $9.00 | $79.00 | $6.58 | $29/yr (27%) |
| Pro | $29.00 | $249.00 | $20.75 | $99/yr (28%) |

---

## Stripe Price IDs

Prices are created once in Stripe Dashboard. IDs are stored as environment variables:

| Price | Environment Variable | Billing Period | Amount |
|-------|---------------------|---------------|--------|
| Starter Monthly | `STRIPE_STARTER_MONTHLY_PRICE_ID` | Every 1 month | $9.00 |
| Starter Annual | `STRIPE_STARTER_ANNUAL_PRICE_ID` | Every 12 months | $79.00 |
| Pro Monthly | `STRIPE_PRO_MONTHLY_PRICE_ID` | Every 1 month | $29.00 |
| Pro Annual | `STRIPE_PRO_ANNUAL_PRICE_ID` | Every 12 months | $249.00 |

---

## Billing Cycles

At launch, only **monthly** billing is the default CTA on the billing page. Annual billing is available via the Plan Comparison Grid's billing cycle toggle.

### Billing Cycle Toggle on Billing Page

The Plan Comparison Grid has a monthly/annual toggle above the plan cards:

```
                    ● Monthly  ○ Annual (save up to 28%)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Free        │  │  Starter     │  │  Pro         │
│  $0/mo       │  │  $9/mo       │  │  $29/mo      │
└──────────────┘  └──────────────┘  └──────────────┘
```

When "Annual" is selected:
```
                    ○ Monthly  ● Annual (save up to 28%)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Free        │  │  Starter     │  │  Pro         │
│  $0/mo       │  │  $6.58/mo    │  │  $20.75/mo   │
│              │  │  $79/yr      │  │  $249/yr     │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Toggle state:** `useState<'monthly' | 'annual'>('monthly')` — default to monthly. Persists only for the duration of the page visit (no cookie/localStorage).

**Toggle component spec:**
- Two pill-style tabs: "Monthly" and "Annual (save up to 28%)"
- Active tab: background Aqua `#B4E7DD`, text Navy `#0C1F40`
- Inactive tab: background transparent, text `#6B7280`
- Border: `1px solid #E5E7EB` around the entire toggle container
- Border-radius: `0px` (PyMC sharp corners)
- Font: Inter Medium, 13px
- Padding per tab: `6px 16px`
- Transition: `background-color 150ms ease`

---

## Currency

**USD only at launch.** No multi-currency support. All prices are in USD. Stripe handles currency conversion for international customers but charges in USD.

---

## Proration

When a user upgrades from Starter → Pro mid-billing-cycle via the Customer Portal:
- Stripe calculates prorated credit for remaining time on Starter
- Prorated charge for remaining time on Pro is applied immediately
- Next billing cycle charges full Pro price

When a user downgrades from Pro → Starter mid-billing-cycle via the Customer Portal:
- Downgrade takes effect at next billing period (not immediately)
- `cancel_at_period_end` is NOT set — the subscription continues at the new price from the next period
- User retains Pro features until the current period ends
- Stripe configuration: "Prorations" → "Create prorations" (default Stripe behavior)

**This is Stripe's default proration behavior — no custom configuration needed.**

---

## Free Trial

**Not available at launch.** No trial period configured on any price. If implemented in the future, a 14-day trial would be added to Starter Monthly and Pro Monthly prices in Stripe Dashboard.

---

## Promotion Codes

`allow_promotion_codes: true` is set on all Checkout Sessions. Stripe's hosted Checkout page shows a "Add promotion code" field. Admin can create promotion codes in Stripe Dashboard.

**Recommended promo code types:**
- Percentage off (e.g., `LAUNCH20` = 20% off forever or first 3 months)
- Fixed amount off (e.g., `SAVE10` = $10 off first month)

Promo codes are managed entirely in Stripe Dashboard — no application code needed.

---

## Invoicing and Receipts

Stripe automatically emails payment receipts to the customer's email address after each successful payment. No application code needed — this is default Stripe behavior.

Invoices are accessible via the Customer Portal → Invoice History.

---

## Tax Handling

Not configured at launch. Stripe Tax can be enabled later in Stripe Dashboard → Settings → Tax. When enabled, Stripe automatically calculates and collects tax based on the customer's billing address.

---

## Failed Payment Recovery

Stripe's Smart Retries (Dunning) configuration:
- Stripe automatically retries failed payments using its ML-based retry schedule
- Default: retry at day 3, day 5, day 7 after first failure
- After all retries exhausted: subscription moves to `status = 'unpaid'` → eventual `customer.subscription.deleted`
- Users receive automatic Stripe dunning emails (configurable in Stripe Dashboard → Settings → Billing → Customer emails)

**Recommended dunning email settings (Stripe Dashboard → Settings → Billing → Customer emails):**
- Send email when payment fails: Yes
- Send email 3 days before card expires: Yes
- Send email when invoice is finalized: Yes
- Send email when subscription is renewed: Yes
