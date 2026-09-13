# Subscriptions

Source of truth for recurring charges. Updated on the 1st-of-month check-in (see `automations/finance-checkin.sh`).

Status: `keep` / `unsure` / `cancel`

## Google Play (billed to Play account)

| Service | Plan | Amount | Cycle | Next charge | ₱/mo equiv | Status |
|---|---|---|---|---|---|---|
| YouTube | Premium | ₱189.00 | monthly | 2026-09-12 | 189.00 | |
| Discord | Nitro Monthly | ₱263.99 | monthly | 2026-09-24 | 263.99 | |
| ChatGPT | Plus | ₱1,100.00 | monthly | 2026-10-06 | 1,100.00 | |
| Insta360 | Moment Pro Yearly (24 clips) | ₱1,910.00 | yearly | 2026-12-05 | 159.17 | |
| Google One | 100 GB | ₱1,190.00 | yearly | 2026-12-13 | 99.17 | |
| Duolingo | Max | ₱3,300.00 | yearly | 2027-01-02 | 275.00 | |
| NordVPN | 1 Year | ₱5,000.00 | yearly | 2027-02-21 | 416.67 | |
| Telegram | Premium | ₱1,590.00 | yearly | 2027-03-11 | 132.50 | |

**Play subtotal: ₱2,635.50/mo — ₱31,626/yr**

The Play list was still scrolling past Telegram — anything below that is unrecorded.

## Card / direct billing

Narrated 2026-09-08, names unconfirmed from voice. Amounts TBD.

| Service | Plan | Amount | Cycle | Next charge | ₱/mo equiv | Status |
|---|---|---|---|---|---|---|
| Supabase | ? | ? | monthly | ? | | unconfirmed |
| Fly.io | ? | ? | monthly | ? | | unconfirmed |
| OpenCode | ? | ? | ? | ? | | unconfirmed |
| Claude Max | ? | ? | monthly | ? | | unconfirmed |
| ??? | | | | | | needs re-narration |

## Financial accounts

Confirmed by Carlos on 2026-09-13:

- Wise
- GCash
- China Bank
- BDO
- Maya

Current reconciliation workflow: collect screenshots or exports for all five
accounts at the monthly check-in. Direct connections have not been verified
for these accounts. Wise offers an API, but access for Carlos's account has
not been established; do not assume it is connected.

## Monthly notes

Reconciled months live beside this file as `YYYY-MM.md`.

## Reconciliation rules

Applied every check-in, before totalling anything.

**Dedupe internal transfers.** Money moving between Carlos's own accounts
(Wise / GCash / China Bank / BDO / Maya) is not spending. An outflow in one account
matched by an inflow in another — same amount, within ~2 days — is one transfer,
counted zero times.

- Exact-amount match is the primary signal.
- Wise legs won't match exactly (FX + fee). Match on the converted amount within
  ~2% and treat the fee as the only real cost.
- Cash-in / cash-out at the same amount on the same day is the same money, not two events.
- When a match is ambiguous, ask rather than guess — a wrong dedupe hides real spending.
