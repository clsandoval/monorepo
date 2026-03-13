# Supabase Realtime Integration Contract

**Aspect:** 5.7 — Supabase Realtime channel config, payload shapes, reconnection
**Wave:** Wave 5 — Integration Contracts
**Written:** 2026-03-13
**References:**
- [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) — Bot-side Python subscription architecture
- [database/schema.md](../database/schema.md) — Table definitions for all subscribed tables
- [database/rls-policies.md](../database/rls-policies.md) — RLS policies that gate Realtime access
- [frontend/dashboard.md](../frontend/dashboard.md) — Dashboard uses Realtime for live bot status
- [api/auth.md](../api/auth.md) — Auth context required for Realtime subscriptions

---

## 1. Architecture Overview

Supabase Realtime is the **sole communication channel** between the Next.js website and the Fly.io bot process. There is no REST or WebSocket API directly between website and bot. All communication is mediated by Supabase PostgreSQL change streams.

```
┌─────────────────────────┐      SQL writes      ┌─────────────────────┐
│   Next.js Website       │ ──────────────────▶  │  Supabase Postgres  │
│   (Vercel)              │                       │                     │
│                         │ ◀── WebSocket push ── │  Realtime Service   │
│   Dashboard: status     │  (bot status changes) │  (logical repl.)    │
└─────────────────────────┘                       └─────────────────────┘
                                                           │
                                                           │ WebSocket push
                                                           │ (new connections,
                                                           │  key changes,
                                                           │  service changes)
                                                           ▼
                                                  ┌─────────────────────┐
                                                  │   Bot (Fly.io)      │
                                                  │   Python asyncio    │
                                                  │   Realtime client   │
                                                  └─────────────────────┘
```

### 1.1 Who Subscribes to What

| Subscriber | Channel | Direction | Purpose |
|------------|---------|-----------|---------|
| Next.js Dashboard | `discord_connections` table | Website ← Postgres | Show live bot status to user |
| Next.js Dashboard | `tenants` table | Website ← Postgres | Show live tenant status (plan, suspension) |
| Bot (Python) | `discord_connections` | Bot ← Postgres | Detect new/updated connections to start/stop Discord clients |
| Bot (Python) | `tenant_api_keys` | Bot ← Postgres | Reload per-tenant Anthropic/OpenAI keys when updated |
| Bot (Python) | `tenant_service_connections` | Bot ← Postgres | Reload OAuth tokens for tool execution |
| Bot (Python) | `tenants` | Bot ← Postgres | Detect plan changes, suspension |

---

## 2. Supabase Project Configuration

### 2.1 Enable Realtime on Required Tables

In the Supabase dashboard under **Database → Replication**, enable Realtime for these tables by adding them to the `supabase_realtime` publication:

```sql
-- Run in Supabase SQL editor to add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_api_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_service_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
```

**Verification query:**
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

Expected result (after adding all tables):
```
 schemaname | tablename
------------+---------------------------
 public     | discord_connections
 public     | tenant_api_keys
 public     | tenant_service_connections
 public     | tenants
```

### 2.2 Row-Level Security Interplay with Realtime

Supabase Realtime respects RLS. The bot uses the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) for its Realtime client — this bypasses RLS and allows the bot to receive events for ALL tenants. The website dashboard uses the **anon key** with a user JWT — this means RLS policies control which rows the website receives events for.

**Critical**: The website's Realtime subscriptions will only receive events for rows that the authenticated user's RLS policies allow them to `SELECT`. This means:
- A dashboard subscription for `discord_connections` will only receive events for connections belonging to the user's tenants.
- No tenant can see another tenant's Realtime events via the website.

See [database/rls-policies.md](../database/rls-policies.md) for the exact RLS policies on each table.

### 2.3 Realtime Settings in supabase/config.toml

```toml
[realtime]
enabled = true
# Max connections — default 200, increase for production
# max_channel_pool_size = 200
# ip_version = "IPv4"
```

In the Supabase Cloud dashboard under **Settings → Realtime**, no additional configuration is required beyond the default. The `supabase_realtime` publication is created automatically.

---

## 3. TypeScript Types for All Payload Shapes

These types are used in the Next.js website (`src/types/realtime.ts`).

```typescript
// src/types/realtime.ts

import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ─── discord_connections ──────────────────────────────────────────────────────

export interface DiscordConnectionRow {
  id: string; // uuid
  tenant_id: string; // uuid
  bot_token: string; // encrypted via Vault — NEVER present in Realtime payload
  guild_id: string;
  bot_user_id: string | null;
  bot_username: string | null;
  status: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'suspended';
  error_message: string | null;
  connected_at: string | null; // ISO 8601
  last_heartbeat_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// The bot_token column is EXCLUDED from Realtime payloads even with service role.
// Supabase Vault columns return null or the encrypted ciphertext — never plaintext.
// The website should NEVER store or display the bot_token from a Realtime event.

export type DiscordConnectionChangePayload =
  RealtimePostgresChangesPayload<DiscordConnectionRow>;

// ─── tenant_api_keys ─────────────────────────────────────────────────────────

export interface TenantApiKeyRow {
  id: string; // uuid
  tenant_id: string; // uuid
  key_type: 'anthropic' | 'openai';
  // key_encrypted is the Vault secret ID (uuid) — never the actual key value
  key_encrypted: string; // uuid pointing to vault.secrets
  is_valid: boolean | null;
  last_validated_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// NOTE: The actual API key value is NEVER present in Realtime payloads.
// The bot retrieves the plaintext key by calling vault.decrypted_secrets
// using the key_encrypted UUID after receiving a Realtime event.

export type TenantApiKeyChangePayload =
  RealtimePostgresChangesPayload<TenantApiKeyRow>;

// ─── tenant_service_connections ──────────────────────────────────────────────

export interface TenantServiceConnectionRow {
  id: string; // uuid
  tenant_id: string; // uuid
  service: 'github' | 'google' | 'linear' | 'toggl' | 'linkedin' | 'dub' | 'fly' | 'onyx' | 'bluedot';
  connection_type: 'oauth' | 'api_key';
  is_connected: boolean;
  // OAuth fields (null for api_key connections)
  oauth_account_id: string | null;
  oauth_account_email: string | null;
  // All token/key data is in Vault — only the Vault secret ID is here
  access_token_encrypted: string | null; // uuid pointing to vault.secrets
  refresh_token_encrypted: string | null; // uuid pointing to vault.secrets
  token_expires_at: string | null; // ISO 8601
  scopes: string[] | null;
  // API key connections
  api_key_encrypted: string | null; // uuid pointing to vault.secrets
  // Status
  last_validated_at: string | null; // ISO 8601
  validation_error: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export type TenantServiceConnectionChangePayload =
  RealtimePostgresChangesPayload<TenantServiceConnectionRow>;

// ─── tenants ─────────────────────────────────────────────────────────────────

export interface TenantRow {
  id: string; // uuid
  name: string;
  slug: string;
  status: 'pending' | 'configured' | 'active' | 'suspended';
  plan: 'free' | 'starter' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export type TenantChangePayload = RealtimePostgresChangesPayload<TenantRow>;
```

---

## 4. Website-Side Channel Subscriptions (Next.js)

The Next.js dashboard uses Supabase Realtime to update the UI without polling. All subscriptions are created in React components or hooks using the `@supabase/ssr` client.

### 4.1 Supabase Client Setup for Realtime

```typescript
// src/lib/supabase/client.ts
// This is the BROWSER client — used in React components.
// It uses the anon key + user's JWT session cookie.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 4.2 Dashboard: Bot Status Real-Time Hook

This hook is used on the Dashboard page to show live bot connection status without requiring a page reload.

```typescript
// src/hooks/useDiscordConnectionStatus.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DiscordConnectionRow } from '@/types/realtime';

export function useDiscordConnectionStatus(tenantId: string, connectionId: string) {
  const [connection, setConnection] = useState<DiscordConnectionRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId || !connectionId) return;

    const supabase = createClient();

    // Initial fetch
    async function fetchInitial() {
      const { data, error: fetchError } = await supabase
        .from('discord_connections')
        .select('*')
        .eq('id', connectionId)
        .eq('tenant_id', tenantId) // Belt-and-suspenders with RLS
        .single();

      if (fetchError) {
        setError(new Error(fetchError.message));
      } else {
        setConnection(data);
      }
      setIsLoading(false);
    }

    fetchInitial();

    // Realtime subscription — filter to specific connection row
    const channel = supabase
      .channel(`discord-connection-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'discord_connections',
          filter: `id=eq.${connectionId}`,
        },
        (payload) => {
          // payload.new contains the updated row
          setConnection(payload.new as DiscordConnectionRow);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Subscription active — real-time updates will flow
        } else if (status === 'CHANNEL_ERROR') {
          setError(new Error('Realtime subscription error'));
        } else if (status === 'TIMED_OUT') {
          setError(new Error('Realtime subscription timed out'));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, connectionId]);

  return { connection, isLoading, error };
}
```

**Status to UI mapping** (used in the Dashboard `<BotStatusCard>` component):

| `status` value | UI badge | Badge color | Description shown to user |
|----------------|----------|-------------|--------------------------|
| `pending` | "Pending" | Gray (`#6B7280`) | "Waiting for bot to connect" |
| `connecting` | "Connecting..." | Yellow (`#F59E0B`) | "Bot is connecting to Discord" |
| `connected` | "Online" | Green (`#10B981`) | "Bot is online and running" |
| `disconnected` | "Offline" | Gray (`#6B7280`) | "Bot is not connected" |
| `error` | "Error" | Red (`#EF4444`) | Value of `error_message` column, or "Connection error — check your bot token" |
| `suspended` | "Suspended" | Red (`#EF4444`) | "This connection has been suspended" |

### 4.3 Dashboard: Tenant Status Real-Time Hook

```typescript
// src/hooks/useTenantStatus.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TenantRow } from '@/types/realtime';

export function useTenantStatus(tenantId: string) {
  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();

    // Initial fetch
    async function fetchInitial() {
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('id, name, slug, status, plan, stripe_customer_id, stripe_subscription_id, created_at, updated_at')
        .eq('id', tenantId)
        .single();

      if (fetchError) {
        setError(new Error(fetchError.message));
      } else {
        setTenant(data);
      }
      setIsLoading(false);
    }

    fetchInitial();

    // Realtime subscription — filter to this tenant's row
    const channel = supabase
      .channel(`tenant-status-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${tenantId}`,
        },
        (payload) => {
          setTenant((prev) => ({ ...prev, ...(payload.new as Partial<TenantRow>) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  return { tenant, isLoading, error };
}
```

### 4.4 Integrations Page: Service Connection Status Hook

```typescript
// src/hooks/useServiceConnections.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TenantServiceConnectionRow } from '@/types/realtime';

export function useServiceConnections(tenantId: string) {
  const [connections, setConnections] = useState<TenantServiceConnectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();

    // Initial fetch — select only safe columns (no encrypted values)
    async function fetchInitial() {
      const { data, error: fetchError } = await supabase
        .from('tenant_service_connections')
        .select(
          'id, tenant_id, service, connection_type, is_connected, ' +
          'oauth_account_id, oauth_account_email, token_expires_at, ' +
          'scopes, last_validated_at, validation_error, created_at, updated_at'
        )
        .eq('tenant_id', tenantId)
        .order('service');

      if (fetchError) {
        setError(new Error(fetchError.message));
      } else {
        setConnections(data || []);
      }
      setIsLoading(false);
    }

    fetchInitial();

    // Realtime subscription — filter to this tenant's connections
    const channel = supabase
      .channel(`service-connections-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tenant_service_connections',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConnections((prev) => [...prev, payload.new as TenantServiceConnectionRow]);
          } else if (payload.eventType === 'UPDATE') {
            setConnections((prev) =>
              prev.map((c) =>
                c.id === (payload.new as TenantServiceConnectionRow).id
                  ? { ...c, ...(payload.new as TenantServiceConnectionRow) }
                  : c
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setConnections((prev) =>
              prev.filter((c) => c.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  return { connections, isLoading, error };
}
```

---

## 5. Channel Names and Filter Specifications

### 5.1 Website Channels (Next.js browser client)

| Channel Name Pattern | Table | Event Filter | `filter` param | Auth |
|----------------------|-------|--------------|----------------|------|
| `discord-connection-{connectionId}` | `discord_connections` | `UPDATE` | `id=eq.{connectionId}` | User JWT (RLS) |
| `tenant-status-{tenantId}` | `tenants` | `UPDATE` | `id=eq.{tenantId}` | User JWT (RLS) |
| `service-connections-{tenantId}` | `tenant_service_connections` | `*` | `tenant_id=eq.{tenantId}` | User JWT (RLS) |

**Channel naming rules:**
- Channel names must be globally unique per Supabase project (not per client).
- Using `{connectionId}` or `{tenantId}` as suffixes ensures uniqueness.
- Maximum channel name length: 64 characters.
- Channel names are case-sensitive.
- Allowed characters: `[a-zA-Z0-9_-]` plus `:` and `.`

### 5.2 Bot Channels (Python service role client)

| Channel Name | Table | Events | Filter | Auth |
|--------------|-------|--------|--------|------|
| `bot-discord-connections` | `discord_connections` | `INSERT`, `UPDATE` | None (receives all rows) | Service role (bypasses RLS) |
| `bot-tenant-api-keys` | `tenant_api_keys` | `INSERT`, `UPDATE` | None (receives all rows) | Service role |
| `bot-service-connections` | `tenant_service_connections` | `INSERT`, `UPDATE`, `DELETE` | None (receives all rows) | Service role |
| `bot-tenant-status` | `tenants` | `UPDATE` | None (receives all rows) | Service role |

See [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) for the Python implementation details.

---

## 6. Complete Payload Shapes

### 6.1 `discord_connections` UPDATE Payload

Received by both the website dashboard hook and the bot's Python client.

```typescript
// TypeScript representation of what Supabase sends
interface DiscordConnectionUpdatePayload {
  schema: 'public';
  table: 'discord_connections';
  commit_timestamp: string; // ISO 8601, e.g. "2026-03-13T14:32:11.000Z"
  eventType: 'UPDATE';
  new: {
    id: string; // "550e8400-e29b-41d4-a716-446655440000"
    tenant_id: string;
    bot_token: null; // ALWAYS null — Vault-encrypted, never returned
    guild_id: string; // "1234567890123456789"
    bot_user_id: string | null; // "9876543210987654321"
    bot_username: string | null; // "MyBot#1234"
    status: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'suspended';
    error_message: string | null;
    connected_at: string | null; // "2026-03-13T14:30:00.000Z"
    last_heartbeat_at: string | null; // "2026-03-13T14:32:00.000Z"
    created_at: string;
    updated_at: string;
  };
  old: {
    id: string;
    // Only primary key and changed columns are populated in `old`
    // for UPDATE events. All other fields may be null/undefined.
    status?: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'suspended';
    updated_at?: string;
  };
  errors: null | string[];
}
```

**Example payload when bot connects successfully:**
```json
{
  "schema": "public",
  "table": "discord_connections",
  "commit_timestamp": "2026-03-13T14:32:11.000Z",
  "eventType": "UPDATE",
  "new": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440001",
    "bot_token": null,
    "guild_id": "1234567890123456789",
    "bot_user_id": "9876543210987654321",
    "bot_username": "Daimon#0042",
    "status": "connected",
    "error_message": null,
    "connected_at": "2026-03-13T14:32:11.000Z",
    "last_heartbeat_at": "2026-03-13T14:32:11.000Z",
    "created_at": "2026-03-13T09:00:00.000Z",
    "updated_at": "2026-03-13T14:32:11.000Z"
  },
  "old": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "connecting",
    "updated_at": "2026-03-13T14:32:05.000Z"
  },
  "errors": null
}
```

**Example payload when bot encounters a token error:**
```json
{
  "schema": "public",
  "table": "discord_connections",
  "commit_timestamp": "2026-03-13T14:33:00.000Z",
  "eventType": "UPDATE",
  "new": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440001",
    "bot_token": null,
    "guild_id": "1234567890123456789",
    "bot_user_id": null,
    "bot_username": null,
    "status": "error",
    "error_message": "Discord returned 401 Unauthorized. Please verify your bot token is correct and the bot has not been deleted from the Discord Developer Portal.",
    "connected_at": null,
    "last_heartbeat_at": null,
    "created_at": "2026-03-13T09:00:00.000Z",
    "updated_at": "2026-03-13T14:33:00.000Z"
  },
  "old": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "connecting",
    "updated_at": "2026-03-13T14:32:05.000Z"
  },
  "errors": null
}
```

### 6.2 `tenant_api_keys` INSERT/UPDATE Payload

Received only by the bot (service role). The website never subscribes to this table via Realtime.

```typescript
interface TenantApiKeyChangePayload {
  schema: 'public';
  table: 'tenant_api_keys';
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE';
  new: {
    id: string; // uuid
    tenant_id: string; // uuid
    key_type: 'anthropic' | 'openai';
    key_encrypted: string; // Vault secret UUID — bot uses this to fetch plaintext
    is_valid: boolean | null;
    last_validated_at: string | null;
    created_at: string;
    updated_at: string;
  };
  old: Partial<{
    id: string;
    key_type: 'anthropic' | 'openai';
    is_valid: boolean | null;
    updated_at: string;
  }>;
  errors: null | string[];
}
```

**Example: user saves a new Anthropic key:**
```json
{
  "schema": "public",
  "table": "tenant_api_keys",
  "commit_timestamp": "2026-03-13T15:00:00.000Z",
  "eventType": "INSERT",
  "new": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440001",
    "key_type": "anthropic",
    "key_encrypted": "880e8400-e29b-41d4-a716-446655440003",
    "is_valid": null,
    "last_validated_at": null,
    "created_at": "2026-03-13T15:00:00.000Z",
    "updated_at": "2026-03-13T15:00:00.000Z"
  },
  "old": {},
  "errors": null
}
```

### 6.3 `tenant_service_connections` Change Payload

Received by the bot. The website subscribes using the hook in section 4.4 above.

```typescript
interface TenantServiceConnectionInsertPayload {
  schema: 'public';
  table: 'tenant_service_connections';
  commit_timestamp: string;
  eventType: 'INSERT';
  new: {
    id: string;
    tenant_id: string;
    service: 'github' | 'google' | 'linear' | 'toggl' | 'linkedin' | 'dub' | 'fly' | 'onyx' | 'bluedot';
    connection_type: 'oauth' | 'api_key';
    is_connected: boolean;
    oauth_account_id: string | null;
    oauth_account_email: string | null;
    access_token_encrypted: string | null; // Vault UUID
    refresh_token_encrypted: string | null; // Vault UUID
    token_expires_at: string | null;
    scopes: string[] | null;
    api_key_encrypted: string | null; // Vault UUID
    last_validated_at: string | null;
    validation_error: string | null;
    created_at: string;
    updated_at: string;
  };
  old: {};
  errors: null | string[];
}

interface TenantServiceConnectionUpdatePayload {
  schema: 'public';
  table: 'tenant_service_connections';
  commit_timestamp: string;
  eventType: 'UPDATE';
  new: TenantServiceConnectionInsertPayload['new'];
  old: Partial<TenantServiceConnectionInsertPayload['new']>;
  errors: null | string[];
}

interface TenantServiceConnectionDeletePayload {
  schema: 'public';
  table: 'tenant_service_connections';
  commit_timestamp: string;
  eventType: 'DELETE';
  new: {};
  old: { id: string; tenant_id: string; service: string };
  errors: null | string[];
}
```

### 6.4 `tenants` UPDATE Payload

Received by both the website dashboard hook and the bot.

```typescript
interface TenantUpdatePayload {
  schema: 'public';
  table: 'tenants';
  commit_timestamp: string;
  eventType: 'UPDATE';
  new: {
    id: string;
    name: string;
    slug: string;
    status: 'pending' | 'configured' | 'active' | 'suspended';
    plan: 'free' | 'starter' | 'pro';
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
  };
  old: Partial<{
    id: string;
    status: string;
    plan: string;
    updated_at: string;
  }>;
  errors: null | string[];
}
```

**Example: admin suspends a tenant:**
```json
{
  "schema": "public",
  "table": "tenants",
  "commit_timestamp": "2026-03-13T16:00:00.000Z",
  "eventType": "UPDATE",
  "new": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "status": "suspended",
    "plan": "starter",
    "stripe_customer_id": "cus_XXXXXXXXXX",
    "stripe_subscription_id": "sub_XXXXXXXXXX",
    "created_at": "2026-03-01T10:00:00.000Z",
    "updated_at": "2026-03-13T16:00:00.000Z"
  },
  "old": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "active",
    "updated_at": "2026-03-10T12:00:00.000Z"
  },
  "errors": null
}
```

---

## 7. Reconnection and Error Handling

### 7.1 Website-Side Reconnection (Next.js)

The Supabase JS v2 client (`@supabase/supabase-js@^2.x`) handles WebSocket reconnection automatically. The `createBrowserClient` from `@supabase/ssr` uses the same underlying client.

**Automatic reconnection behavior:**
- The Supabase client automatically reconnects if the WebSocket drops.
- Reconnection uses exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s.
- After reconnection, subscriptions are automatically re-established.
- There is **no gap filling** — events that occurred during the disconnection window are not replayed.

**Handling stale data after reconnection:**

```typescript
// src/hooks/useDiscordConnectionStatus.ts — enhanced with stale refetch
const channel = supabase
  .channel(`discord-connection-${connectionId}`)
  .on('postgres_changes', /* ... */ (payload) => {
    setConnection(payload.new as DiscordConnectionRow);
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      // Refetch current state on (re)subscribe to fill any gap
      fetchInitial();
    }
  });
```

**Always call `fetchInitial()` inside the `SUBSCRIBED` callback** to ensure the UI reflects the current state after any reconnection gap.

### 7.2 Website Subscription Status Values

The `.subscribe()` callback receives one of these status strings:

| Status | Meaning | Action |
|--------|---------|--------|
| `SUBSCRIBED` | WebSocket connected, subscription active | Call `fetchInitial()` to fill reconnection gap |
| `TIMED_OUT` | Subscription attempt timed out | Show error state, set `error` |
| `CLOSED` | Channel closed (component unmounted, explicit `removeChannel`) | No action needed |
| `CHANNEL_ERROR` | Subscription failed (auth error, invalid filter, etc.) | Show error state, log to Sentry |

### 7.3 Bot-Side Reconnection (Python)

The bot uses `supabase-py` with `realtime-py`. See [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) for the full Python reconnection implementation.

Key points:
- Bot uses `SUPABASE_SERVICE_ROLE_KEY` — auth never expires, so reconnection is only due to network issues.
- On reconnection, the bot re-subscribes to all 4 channels and does a full state reload from the database (not just from Realtime events).
- The `TenantConnectionManager.reconnect()` method handles this: it re-fetches all active `discord_connections` rows and reconciles the in-memory state.

### 7.4 Handling Supabase Realtime Outages

If Supabase Realtime is unavailable, the website falls back gracefully:
- Dashboard shows last-known bot status with a "Status may be outdated" yellow banner.
- The banner appears when `CHANNEL_ERROR` or `TIMED_OUT` is received.
- Clicking "Refresh" button triggers a manual refetch of the connection status.

If the bot cannot connect to Realtime:
- Bot logs an error and retries every 30 seconds.
- Bot continues serving existing connected tenants (Discord connections already established are not affected — only new `INSERT` events from the website are missed).
- The bot performs a full state reload from PostgreSQL on each reconnect attempt to catch any events missed during the outage.

---

## 8. Security Considerations

### 8.1 What the Website Must NEVER Do

1. **Never subscribe to `tenant_api_keys` or encrypted columns.** The website reads key metadata (e.g., `is_valid`, `last_validated_at`) via regular Supabase queries, not Realtime.
2. **Never expose `key_encrypted` vault UUIDs** in client-side state or logs.
3. **Never use the service role key in the browser.** The service role key is only used server-side (API routes, Edge Functions) and by the bot.
4. **Never send a Realtime event payload containing a bot token to the client.** The `bot_token` column is always `null` in Realtime payloads (it is Vault-encrypted at rest and never exposed via CDC).

### 8.2 RLS and Realtime Interaction

When a user's JWT is used with the Realtime client:
- The Realtime service enforces RLS policies on `SELECT` for CDC events.
- A user can only receive events for rows where `auth.uid()` matches the row's tenant membership.
- This is enforced at the Supabase server level — the client cannot bypass it.

RLS policies that gate Realtime access (from [database/rls-policies.md](../database/rls-policies.md)):

```sql
-- discord_connections: user can only see their tenant's connections
CREATE POLICY "discord_connections_select_policy"
ON public.discord_connections
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_members
    WHERE user_id = auth.uid()
  )
);

-- tenants: user can only see tenants they are a member of
CREATE POLICY "tenants_select_policy"
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tenant_id FROM public.tenant_members
    WHERE user_id = auth.uid()
  )
);

-- tenant_service_connections: user can only see their tenant's connections
CREATE POLICY "tenant_service_connections_select_policy"
ON public.tenant_service_connections
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_members
    WHERE user_id = auth.uid()
  )
);
```

### 8.3 Channel Isolation

Since channel names are arbitrary strings and channel subscriptions are gated by RLS, channel name collisions between tenants are harmless — a user subscribing to `discord-connection-{connectionId}` for a connection they don't own will receive no events (RLS returns no rows).

---

## 9. Environment Variables Required

| Variable | Used By | Description | Example |
|----------|---------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser client | Supabase project URL | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Bot Python client | Service role key (bypasses RLS) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_URL` | Bot Python client | Same URL as above | `https://abcdefgh.supabase.co` |

See [deployment/environment.md](../deployment/environment.md) for the full environment variable inventory.

---

## 10. Testing Realtime Subscriptions

### 10.1 Manual Testing via Supabase SQL Editor

To test a subscription manually, trigger a status change directly in the database:

```sql
-- Simulate bot connecting (triggers website dashboard update)
UPDATE public.discord_connections
SET
  status = 'connected',
  bot_user_id = '9876543210987654321',
  bot_username = 'TestBot#9999',
  connected_at = NOW(),
  last_heartbeat_at = NOW(),
  updated_at = NOW()
WHERE id = '{your-connection-id}';

-- Simulate bot error (triggers error state in dashboard)
UPDATE public.discord_connections
SET
  status = 'error',
  error_message = 'Discord returned 401 Unauthorized. Please verify your bot token.',
  updated_at = NOW()
WHERE id = '{your-connection-id}';

-- Simulate plan upgrade (triggers tenant status update)
UPDATE public.tenants
SET plan = 'pro', updated_at = NOW()
WHERE id = '{your-tenant-id}';
```

### 10.2 Integration Test Pattern (Vitest)

```typescript
// src/__tests__/realtime.integration.test.ts
// Requires a real Supabase project (use .env.test.local with test project credentials)

import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Realtime discord_connections subscription', () => {
  let supabase: ReturnType<typeof createClient>;
  let serviceSupabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_ANON_KEY!
    );
    serviceSupabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  afterEach(async () => {
    await supabase.removeAllChannels();
    await serviceSupabase.removeAllChannels();
  });

  it('receives UPDATE event when bot status changes', async () => {
    const connectionId = 'test-connection-id'; // Pre-seeded test row
    const receivedPayloads: unknown[] = [];

    const channel = supabase
      .channel('test-discord-connection')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'discord_connections',
        filter: `id=eq.${connectionId}`,
      }, (payload) => {
        receivedPayloads.push(payload);
      })
      .subscribe();

    // Wait for subscription to be active
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Trigger the update via service role
    await serviceSupabase
      .from('discord_connections')
      .update({ status: 'connected', updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    // Wait for event to arrive
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(receivedPayloads).toHaveLength(1);
    expect((receivedPayloads[0] as any).new.status).toBe('connected');

    await supabase.removeChannel(channel);
  });
});
```

---

## 11. Known Limitations and Edge Cases

### 11.1 No Event Replay

Supabase Realtime does not buffer or replay missed events. If the browser tab is closed and reopened, or if the WebSocket reconnects after a gap, events from the disconnection window are lost. The mitigation is always calling `fetchInitial()` on subscription and on `SUBSCRIBED` status callback.

### 11.2 Realtime Concurrency Limits

Supabase Free tier: 200 concurrent Realtime connections.
Supabase Pro tier: 500 concurrent Realtime connections.
Supabase Team tier: 3,000 concurrent connections.

Each browser tab with an active dashboard creates 1–3 Realtime channels. Plan for ~2 channels per active dashboard user. At 500 concurrent connections (Pro tier), Daimon supports ~250 simultaneous dashboard users before needing Team tier.

### 11.3 Filter Syntax Constraints

Supabase Realtime `filter` parameter supports only simple equality filters on indexed columns in the format `column=eq.value`. It does NOT support:
- `IN` filters (`column=in.(val1,val2)`)
- `OR` conditions
- Nested object filters
- Non-equality comparisons (no `gt`, `lt`, `neq`)

This is why the website subscribes per-connection (`id=eq.{connectionId}`) rather than per-tenant.

### 11.4 Column Exclusions from CDC

The following columns are excluded from Realtime payloads (they return `null` regardless of actual value):
- `discord_connections.bot_token` — Vault-encrypted, CDC payload always returns null
- `tenant_api_keys.key_encrypted` — Vault UUID, returned as-is (not the plaintext key)
- `tenant_service_connections.access_token_encrypted` — Vault UUID
- `tenant_service_connections.refresh_token_encrypted` — Vault UUID
- `tenant_service_connections.api_key_encrypted` — Vault UUID

**Important:** The Vault UUID values (pointers to `vault.secrets`) ARE returned in CDC payloads. They are safe to expose since they are UUIDs, not the actual secrets. The bot uses these UUIDs to query `vault.decrypted_secrets` server-side.

### 11.5 Multi-Tab Behavior

If a user has multiple dashboard tabs open, each tab creates its own Realtime subscription. All tabs receive the same events and update independently. There is no shared state between tabs — each tab maintains its own React state. This is acceptable behavior; the UI will converge to the same state as events arrive.
