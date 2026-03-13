# Features by Tier — Daimon SaaS

> Aspect: 5.1 (Stripe integration — feature gating rules)
> Written: 2026-03-13
> Related: [tiers.md](./tiers.md), [pricing.md](./pricing.md), [../integrations/stripe.md](../integrations/stripe.md)

---

## Complete Feature Matrix

| Feature | Free | Starter | Pro |
|---------|------|---------|-----|
| **Discord Connections** | 1 | Up to 3 | Unlimited |
| **All 50+ tools** | ✓ | ✓ | ✓ |
| **BYOK Anthropic API key** | ✓ (required) | ✓ (required) | ✓ (required) |
| **BYOK OpenAI API key** | ✓ (optional) | ✓ (optional) | ✓ (optional) |
| **Discord tool module** (7 tools) | ✓ | ✓ | ✓ |
| **Toggl tool module** (34 tools) | ✓ | ✓ | ✓ |
| **GitHub tool module** (1 tool) | ✓ | ✓ | ✓ |
| **Google tool module** (1 tool) | ✓ | ✓ | ✓ |
| **Linear MCP** (6 tools) | ✓ | ✓ | ✓ |
| **Fly tool module** (9 tools) | ✓ | ✓ | ✓ |
| **Dub tool module** (2 tools) | ✓ | ✓ | ✓ |
| **LinkedIn tool module** (17 tools) | ✓ | ✓ | ✓ |
| **Google Analytics tool module** (4 tools) | ✓ | ✓ | ✓ |
| **Onyx tool module** (2 tools) | ✓ | ✓ | ✓ |
| **Bluedot tool module** (4 tools) | ✓ | ✓ | ✓ |
| **ACP tool module** (4 tools) | ✓ | ✓ | ✓ |
| **Decision Hub tool module** (4 tools) | ✓ | ✓ | ✓ |
| **Credentials tool** (1 tool) | ✓ | ✓ | ✓ |
| **Dashboard** | ✓ | ✓ | ✓ |
| **Bot status monitoring** | ✓ | ✓ | ✓ |
| **Service integrations (OAuth/API key)** | ✓ | ✓ | ✓ |
| **Community support (Discord)** | ✓ | ✓ | ✓ |
| **Email support** | ✗ | ✓ (2 biz days) | ✓ (1 biz day) |
| **Priority support** | ✗ | ✗ | ✓ |
| **99.9% uptime SLA** | ✗ | ✗ | ✓ |
| **Annual billing discount** | n/a | ✓ ($79/yr) | ✓ ($249/yr) |

---

## Gating Rules

### Rule 1: Discord Connection Limit

This is the **only** hard feature gate. All other features are available to all tiers.

| Plan | Max Active Discord Connections |
|------|-------------------------------|
| free | 1 |
| starter | 3 |
| pro | `Infinity` (no limit) |

**Enforcement:** API route `POST /api/connections/discord` checks count before inserting. See [tiers.md](./tiers.md#connection-limit-enforcement) for exact implementation.

**Suspended connections:** Do not count toward the limit. A suspended connection is one with `status = 'suspended'` in `discord_connections`.

**Definition of "active":** A connection is active if `status IN ('pending', 'connecting', 'connected', 'error')`. Only `disconnected` and `suspended` are excluded from the count.

```sql
-- Count active connections for a tenant
SELECT COUNT(*) FROM discord_connections
WHERE tenant_id = $tenant_id
AND status NOT IN ('disconnected', 'suspended');
```

### Rule 2: No Other Gates

There are no tool gates, no usage caps (other than the user's own Anthropic API key limits), no feature flags per plan.

**Why no tool gating:** The BYOK model means Daimon doesn't pay for AI compute. Every user bringing their own Anthropic key removes the cost incentive to gate tools. The connection limit is the sole lever to drive upgrades — it targets the most natural expansion vector (running multiple Discord communities).

---

## Bot Behavior by Plan

The bot reads `tenants.plan` at startup and enforces the connection limit:

```python
# In the multi-tenant connection manager (bot code)
MAX_CONNECTIONS = {
    'free': 1,
    'starter': 3,
    'pro': float('inf'),
}

plan = tenant_config.get('plan', 'free')
max_conns = MAX_CONNECTIONS[plan]

active_connections = [c for c in connections if c['status'] not in ('disconnected', 'suspended')]
connections_to_activate = active_connections[:max_conns]
connections_to_suspend = active_connections[max_conns:]

for conn in connections_to_suspend:
    await suspend_connection(conn['id'], reason='plan_limit_exceeded')
```

**Note:** The bot enforces the limit on startup and when the plan changes via Realtime. It does not periodically recheck — plan changes arrive as Realtime events.

---

## Support Tiers

### Community Support (Free)

- Access to Daimon Discord server: `discord.gg/daimon` (permanent invite; created when Discord server is established at launch)
- GitHub Issues for bug reports: `github.com/pymc-labs/daimon` (public repository; created at launch — forward loop uses this URL as-is in all footer/support links)
- No SLA, no guaranteed response time
- Best-effort responses from community and core team

### Email Support (Starter)

- Email: `support@daimon.ai`
- Response SLA: 2 business days (Monday–Friday, 9am–5pm UTC-5/EST)
- Scope: Bug reports, configuration help, integration setup, billing questions
- No phone or chat support

### Priority Support (Pro)

- Email: `support@daimon.ai` — same address, flagged as priority in support system
- Response SLA: 1 business day
- Escalation path: Direct contact with core team for severe issues
- Scope: Everything in Starter support + proactive outreach if bot goes down

---

## Uptime SLA (Pro Only)

**SLA Commitment:** 99.9% monthly uptime for bot connectivity.

**99.9% uptime = max 43.8 minutes of downtime per month.**

**What counts as downtime:**
- Bot in `error` or `disconnected` status for 5+ consecutive minutes
- Caused exclusively by Daimon infrastructure failures (Fly.io, Supabase, or application bugs in the multi-tenant bot)

**What does NOT count as downtime:**
- User's bot token is invalid/revoked
- Discord platform outage (discord.com status page)
- User's own Discord guild issues (ban, server deleted, etc.)
- Fly.io platform-wide outages (outside Daimon's control)
- Scheduled maintenance (announced 24 hours in advance via status page)
- Anthropic API outages (BYOK means Claude calls may fail, but this is not bot "downtime")

**Measurement:** Bot heartbeat data stored in `discord_connections.last_heartbeat_at` and status history. Downtime periods are computed as gaps in heartbeat > 5 minutes where `status = 'error'` or `status = 'disconnected'`.

**Remedy:** Service credit equal to 10% of monthly fee per 0.1% below SLA, up to 30% of monthly fee.

| Monthly Uptime | Credit |
|----------------|--------|
| 99.9% – 100% | 0% (within SLA) |
| 99.0% – 99.9% | 10% of monthly fee |
| 98.0% – 99.0% | 20% of monthly fee |
| Below 98.0% | 30% of monthly fee (maximum) |

**Credit process:** User must request credit by emailing `support@daimon.ai` with the affected month and observed downtime. Credits applied to next invoice.

**Note:** SLA credits are the sole remedy for uptime failures. They do not constitute a right to refund.
