# Discord Integration — Token Handling, Validation, Storage, Error Scenarios

**Aspect:** 5.2 — Discord token handling
**Created:** 2026-03-13
**Related files:**
- [database/schema.md — Table: discord_connections](../database/schema.md#table-discord_connections)
- [database/vault-encryption.md](../database/vault-encryption.md)
- [frontend/settings-page.md](../frontend/settings-page.md)
- [api/routes.md](../api/routes.md)
- [multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md)
- [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md)

---

## 1. Overview

Daimon uses a **Bring Your Own Bot Token** (BYOBT) model. The user creates their own Discord application and bot user on the Discord Developer Portal, copies the bot token, and pastes it into the Daimon dashboard. There is **no Discord OAuth for platform authentication** — users authenticate to the Daimon website using email/password (Supabase Auth), not Discord.

The bot token is the credential that allows the Daimon backend to connect to Discord on the tenant's behalf. The guild ID identifies which Discord server the bot should operate in.

**What the user provides:**
1. **Discord Bot Token** — A string like `MTIzNDU2Nzg5MDEyMzQ1Njc4.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
2. **Discord Guild ID** — A 17–20 digit snowflake ID like `1234567890123456789`

**What Daimon does NOT do:**
- Does not use Discord OAuth (`discord.com/oauth2/authorize`) to authenticate the platform user.
- Does not store the user's personal Discord account credentials.
- Does not require the bot to be invited to the guild during the token-save step — the invitation check is advisory, not blocking (the bot cannot verify guild membership until it connects).
- Does not store the bot token in any column other than Vault.

---

## 2. Discord Bot Token — Format and Structure

### 2.1 Token Format

Discord bot tokens have the following structure:

```
{base64(bot_user_id)}.{timestamp_encoded}.{hmac_signature}
```

**Examples by bot account generation:**

| Token Format | Example Prefix | Description |
|-------------|---------------|-------------|
| Legacy (Discord pre-2023) | `MTIzNDU2Nzg5.` | 64-char base64-encoded user ID segment |
| Modern (Discord 2023+) | `MTIzNDU2Nzg5MDEy` | Slightly longer base64-encoded segment |

**Full example (redacted):** `MTIzNDU2Nzg5MDEyMzQ1Njc4.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Structural rules observed:**
1. The token is a dot-separated string with **exactly 3 parts** when split on `.`
2. **Part 1 (prefix):** Base64-encoded Discord user ID (the bot's snowflake ID). When decoded, it is a 17–20 digit integer.
3. **Part 2 (timestamp):** 6 characters, base64-encoded timestamp.
4. **Part 3 (HMAC):** 27 characters (HMAC-SHA256 truncated), contains URL-safe base64 characters (`A-Za-z0-9_-`).
5. Total length: typically 59–77 characters.

**Prefixed token format (also valid):** Discord sometimes shows tokens with a `Bot ` prefix in documentation. The `Bot ` prefix is for the HTTP Authorization header, NOT part of the raw token itself. The token stored in the database and passed to `discord.py` is the **raw token without the `Bot ` prefix**.

### 2.2 Token Format Validation (Client-Side + Server-Side)

**Client-side (browser, before API call):**

```typescript
// Regex for Discord bot token structural validation
// Part 1: base64 alphanum (the encoded user ID), 24+ chars
// Part 2: short base64 segment, 4–8 chars
// Part 3: HMAC-SHA256 base64url, 27 chars
const DISCORD_TOKEN_REGEX = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/;

function isValidDiscordTokenFormat(token: string): boolean {
  const trimmed = token.trim();
  // Strip "Bot " prefix if user accidentally included it
  const raw = trimmed.startsWith('Bot ') ? trimmed.slice(4) : trimmed;
  return DISCORD_TOKEN_REGEX.test(raw);
}
```

**If the format is invalid client-side:** Show inline error immediately on blur, do not submit.

- Error message: `"This doesn't look like a valid Discord bot token. Make sure you copied the token from the Discord Developer Portal, not the application's Client ID or Client Secret."`

**Server-side format validation (in `/api/discord/validate-token` route):**

The server reapplies the same regex. If the format is invalid, return immediately without making any Discord API call:

```typescript
// POST /api/discord/validate-token
// Body: { token: string, guild_id: string }

const raw = body.token.trim().startsWith('Bot ')
  ? body.token.trim().slice(4)
  : body.token.trim();

if (!DISCORD_TOKEN_REGEX.test(raw)) {
  return Response.json(
    { valid: false, error: 'invalid_format', message: 'Token format is invalid.' },
    { status: 400 }
  );
}
```

### 2.3 Guild ID Format Validation

**Format:** Discord Guild IDs (also called Server IDs) are **17–20 digit decimal integers** (Discord "snowflakes"). They look like `1234567890123456789`.

**Validation regex:** `^[0-9]{17,20}$`

**Client-side validation on blur:**
- If empty: `"Guild ID is required."`
- If format invalid: `"Guild ID must be a 17–20 digit number. You can find it by right-clicking your server name in Discord and selecting 'Copy Server ID'. Enable Developer Mode in Discord settings if the option is not visible."`

**Server-side:** Same regex reapplied before storing.

---

## 3. Token Validation API — `/api/discord/validate-token`

### 3.1 Purpose

Before storing a bot token, the Daimon website makes a live API call to Discord to verify the token is valid. This gives the user immediate feedback rather than waiting for the bot process to attempt a connection.

**What the validation checks:**

1. Token format (structural regex) — checked first
2. Token authenticity — calls Discord's `GET /api/v10/users/@me` with `Authorization: Bot {token}`
3. Token is a bot token (not a user token) — confirmed by `type == 0` ("Application") in the response
4. Bot's intents (advisory only) — cannot be checked via REST before gateway connection; skip
5. Guild membership (advisory only) — cannot be verified without gateway connection; skip

**What the validation DOES NOT check:**

- Whether the bot has been invited to the guild (this requires gateway connection or guild-specific permissions endpoint)
- Whether the bot has the correct permissions in the guild (requires guild connection)
- Whether Message Content intent is enabled (requires gateway connection)

### 3.2 Request

```
POST /api/discord/validate-token
Authorization: Bearer {supabase_jwt}
Content-Type: application/json

{
  "token": "MTIzNDU2Nzg5MDEyMzQ1Njc4.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "guild_id": "1234567890123456789"
}
```

**Field constraints:**

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|-----------|-------|
| `token` | string | Yes | 200 chars | Raw bot token (without `Bot ` prefix); server strips prefix if present |
| `guild_id` | string | Yes | 20 chars | 17–20 digit snowflake string |

### 3.3 Server-Side Validation Logic

```typescript
// /api/discord/validate-token/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  const body = await request.json()
  const { token: rawToken, guild_id } = body

  // 3. Sanitize token — strip "Bot " prefix if present
  const token = typeof rawToken === 'string'
    ? rawToken.trim().replace(/^Bot\s+/i, '')
    : ''

  // 4. Format validation — token
  const TOKEN_REGEX = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{4,8}\.[A-Za-z0-9_-]{27}$/
  if (!TOKEN_REGEX.test(token)) {
    return Response.json({
      valid: false,
      error: 'invalid_token_format',
      message: 'Bot token format is invalid. Copy the token from the Bot section of the Discord Developer Portal.'
    }, { status: 400 })
  }

  // 5. Format validation — guild_id
  const GUILD_ID_REGEX = /^[0-9]{17,20}$/
  if (!GUILD_ID_REGEX.test(guild_id)) {
    return Response.json({
      valid: false,
      error: 'invalid_guild_id_format',
      message: 'Guild ID must be a 17–20 digit number.'
    }, { status: 400 })
  }

  // 6. Rate limit check: max 10 validation attempts per tenant per 10 minutes
  // Checked against a rate_limit_discord_validate:{tenant_id} key in Supabase KV
  // (See rate-limiting.md for implementation)
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // 7. Call Discord API to validate token
  let discordUser: { id: string; username: string; discriminator: string; bot: boolean } | null = null
  try {
    const discordResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'User-Agent': 'DaimonSaaS/1.0 (https://daimon.ai)'
      },
      signal: AbortSignal.timeout(8000)  // 8 second timeout
    })

    if (discordResponse.status === 401) {
      return Response.json({
        valid: false,
        error: 'invalid_token',
        message: 'Bot token is invalid or has been revoked. Regenerate the token in the Discord Developer Portal.'
      }, { status: 200 })  // 200 because this is a valid API response, not a server error
    }

    if (discordResponse.status === 429) {
      return Response.json({
        valid: false,
        error: 'discord_rate_limited',
        message: 'Discord rate limit reached. Please wait 60 seconds and try again.'
      }, { status: 200 })
    }

    if (!discordResponse.ok) {
      return Response.json({
        valid: false,
        error: 'discord_api_error',
        message: `Discord API returned an error (${discordResponse.status}). Please try again.`
      }, { status: 200 })
    }

    discordUser = await discordResponse.json()
  } catch (err) {
    // Timeout or network error
    return Response.json({
      valid: false,
      error: 'discord_unreachable',
      message: 'Could not reach Discord API. Please check your internet connection and try again.'
    }, { status: 200 })
  }

  // 8. Confirm it is actually a bot token (not a user account token)
  if (!discordUser?.bot) {
    return Response.json({
      valid: false,
      error: 'not_a_bot_token',
      message: 'This appears to be a user account token, not a bot token. You must use a bot token from the Discord Developer Portal.'
    }, { status: 200 })
  }

  // 9. Return success with bot identity
  // Construct display name: new-style usernames have discriminator "0"
  const displayName = discordUser.discriminator === '0'
    ? discordUser.username
    : `${discordUser.username}#${discordUser.discriminator}`

  return Response.json({
    valid: true,
    bot_user_id: discordUser.id,
    bot_username: displayName,
    message: `Validated. Bot is: ${displayName}`
  }, { status: 200 })
}
```

### 3.4 Response Shapes

**Success (token is valid):**

```json
{
  "valid": true,
  "bot_user_id": "1234567890123456789",
  "bot_username": "MyBotName",
  "message": "Validated. Bot is: MyBotName"
}
```

**Failure — invalid token:**

```json
{
  "valid": false,
  "error": "invalid_token",
  "message": "Bot token is invalid or has been revoked. Regenerate the token in the Discord Developer Portal."
}
```

**Failure — invalid format:**

```json
{
  "valid": false,
  "error": "invalid_token_format",
  "message": "Bot token format is invalid. Copy the token from the Bot section of the Discord Developer Portal."
}
```

**Failure — not a bot token:**

```json
{
  "valid": false,
  "error": "not_a_bot_token",
  "message": "This appears to be a user account token, not a bot token. You must use a bot token from the Discord Developer Portal."
}
```

**Failure — Discord rate limited:**

```json
{
  "valid": false,
  "error": "discord_rate_limited",
  "message": "Discord rate limit reached. Please wait 60 seconds and try again."
}
```

**Failure — Discord unreachable:**

```json
{
  "valid": false,
  "error": "discord_unreachable",
  "message": "Could not reach Discord API. Please check your internet connection and try again."
}
```

**Failure — server rate limit hit (too many validation attempts):**

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many validation attempts. Please wait 10 minutes before trying again."
}
```
HTTP status: `429`

---

## 4. Token Storage — Supabase Vault

The bot token is **never stored in a plain-text column**. It is stored exclusively in Supabase Vault (`vault.secrets`). The `discord_connections.vault_secret_id` column holds the UUID reference to the Vault secret.

### 4.1 Token Storage Flow (Saving a New Connection)

This flow executes in the Supabase Edge Function `store-discord-connection` (called server-side from the Next.js API route after successful validation). The Edge Function runs with the **service role key** to access Vault.

```
1. Validate token format (regex)
2. Call Discord API: GET /api/v10/users/@me with Bot token
3. If validation fails → return error, DO NOT proceed to storage
4. If validation succeeds:
   a. Store token in Vault:
      vault_secret_id = vault.create_secret(
        token_plaintext,
        'discord_token:{tenant_id}:{guild_id}',
        'Discord bot token for tenant {tenant_id}, guild {guild_id}'
      )
   b. Insert (or upsert) discord_connections row:
      INSERT INTO discord_connections (
        tenant_id, guild_id, vault_secret_id, status,
        bot_user_id, bot_username
      ) VALUES (
        $tenant_id, $guild_id, $vault_secret_id, 'pending',
        $bot_user_id, $bot_username
      )
      ON CONFLICT (tenant_id, guild_id)
      DO UPDATE SET
        vault_secret_id = EXCLUDED.vault_secret_id,
        status = 'pending',
        bot_user_id = EXCLUDED.bot_user_id,
        bot_username = EXCLUDED.bot_username,
        error_message = NULL,
        updated_at = NOW()
   c. If the UPSERT hit a conflict (existing row): delete old vault secret
      vault.delete_secret(old_vault_secret_id)
   d. Notify bot via Supabase Realtime:
      Realtime INSERT or UPDATE event fires automatically on discord_connections
5. Return connection record (with bot_username) to frontend
```

### 4.2 Vault Secret Naming Convention

| Context | Secret Name Pattern | Example |
|---------|-------------------|---------|
| Initial connection creation | `discord_token:{tenant_id}:{guild_id}` | `discord_token:abc123:1234567890` |
| After guild_id is confirmed | Same pattern retained | — |

**Description field in Vault:** `"Discord bot token for tenant {tenant_id}, guild {guild_id}, bot {bot_username}"`

### 4.3 Token Retrieval by Bot

The bot reads the token at startup (and on Realtime hot-reload):

```python
# In TenantConnectionManager (multi-tenant/connection-manager.md)
# The bot uses the Supabase service role client to access Vault

async def _get_bot_token(self, vault_secret_id: str) -> str:
    """Decrypt and return the bot token for a given vault_secret_id."""
    result = await self.supabase.rpc('vault_decrypt', {
        'secret_id': vault_secret_id
    }).execute()
    # OR directly:
    result = await self.supabase.table('vault.decrypted_secrets') \
        .select('decrypted_secret') \
        .eq('id', vault_secret_id) \
        .single() \
        .execute()
    return result.data['decrypted_secret']
```

**Exact SQL used by bot:**

```sql
SELECT decrypted_secret
FROM vault.decrypted_secrets
WHERE id = $vault_secret_id;
```

This requires the service role key — the `decrypted_secrets` view is only accessible to the service role. The bot's Supabase client is always initialized with the service role key.

### 4.4 Token Masking

The bot token is **never returned to the browser** in any API response. The `discord_connections` row never contains the plaintext token — only `vault_secret_id`.

**Display in UI:** The token is displayed as a masked hint. The `key_hint` equivalent for discord connections is derived as follows:

The `discord_connections` table does **not** have a `key_hint` column — unlike `tenant_api_keys`. Instead, the frontend derives the display from `bot_username` and `bot_user_id`:

```
Display: "Connected as MyBotName (Bot ID: 1234567890123456789)"
```

The **token itself is never shown after save**, not even masked. When the user wants to update their token, they paste a completely new one.

If the user requests to "view" their token, the button is not present. The only action is to "Replace Token" (which requires pasting a new token).

---

## 5. Connection Lifecycle — All Scenarios

### 5.1 Initial Connection (New Tenant)

```
User navigates to /dashboard/settings
  ↓
Clicks "Add Discord Connection"
  ↓
Paste token modal opens (see frontend/settings-page.md §2)
  ↓
User pastes token and guild ID
  ↓
Client-side validation: format regex on blur
  ↓
User clicks "Validate & Connect"
  ↓
Button enters loading state: spinner, text "Validating..."
  ↓
POST /api/discord/validate-token → Discord API response
  ↓
If valid:
  POST /api/discord/save-connection (stores in Vault + inserts discord_connections row)
    ↓
    discord_connections row created with status='pending'
    ↓
    Supabase Realtime fires INSERT event to bot
    ↓
    Bot picks up INSERT, starts connecting to Discord gateway
    ↓
    Bot sets status='connecting' → 'connected' on success
    ↓
    Dashboard shows real-time status update (Realtime subscription on discord_connections)
If invalid:
  Show inline error in modal (see §6 for all error messages)
  Token field re-enabled, user can correct and retry
```

### 5.2 Token Update (Replace Existing)

```
User on /dashboard/settings
  ↓
Clicks "Replace Token" button next to existing connection
  ↓
Confirmation step: "Replacing the token will briefly disconnect the bot while it reconnects."
  ↓
Token input modal opens (guild ID pre-filled and locked — cannot change guild for existing connection)
  ↓
User pastes new token
  ↓
Client-side format validation
  ↓
POST /api/discord/validate-token (only token, guild_id unchanged)
  ↓
If valid: POST /api/discord/save-connection (UPSERT path)
  - New Vault secret created with new token
  - discord_connections row updated: vault_secret_id = new, status = 'pending'
  - Old Vault secret deleted
  - Realtime UPDATE event fires → bot executes hot-reload: disconnect old session, connect with new token
If invalid: inline error, retry
```

**Why the guild ID cannot change on update:** A guild ID change would be semantically a different connection (different Discord server). The correct flow is to disconnect the old connection and create a new one. The UI does not allow editing guild_id on an existing connection — it is display-only after creation.

### 5.3 Manual Disconnect (User-Initiated)

```
User clicks "Disconnect" button on an existing connection in /dashboard/settings
  ↓
Confirmation dialog: "Are you sure you want to disconnect this bot? The bot will leave your Discord server immediately."
  ↓
User confirms
  ↓
DELETE /api/discord/save-connection/:connection_id
  ↓
API route:
  1. Verify tenant membership and owner/admin role
  2. Fetch discord_connections row to get vault_secret_id
  3. Update discord_connections: status='disconnected'
  4. Realtime UPDATE fires → bot receives, calls client.close() for this tenant
  5. After bot confirms disconnect (or after 5s timeout): delete discord_connections row
  6. Delete vault secret: vault.delete_secret(vault_secret_id)
  ↓
UI: connection card removed, success toast "Bot disconnected."
```

**Note:** The bot does NOT delete the Vault secret — only the website API does. The bot only writes status, last_heartbeat, error_message, bot_user_id, bot_username.

### 5.4 Token Becomes Invalid (Revoked by User Outside Daimon)

This scenario occurs when:
- The user regenerates their bot token in the Discord Developer Portal (which invalidates the old token)
- The bot application is deleted from the Developer Portal
- Discord security incident causes token invalidation

```
Bot is connected with tenant's token
  ↓
Token is revoked on Discord's side
  ↓
Discord sends close code 4004 ("Authentication failed") to the bot's WebSocket
  ↓
discord.py raises LoginFailure exception in on_error/on_disconnect
  ↓
TenantConnectionManager catches the error
  ↓
Bot updates discord_connections:
  - status = 'error'
  - error_message = 'Bot token has been invalidated. Please regenerate your token in the Discord Developer Portal and update it here.'
  ↓
Realtime UPDATE event fires (status changed to 'error')
  ↓
Frontend Dashboard: bot status badge changes to "Error" (red)
  ↓
Dashboard shows error card with actionable message and "Replace Token" button
  ↓
Email notification queued (if email notifications are enabled for tenant — future feature)
```

**The bot does NOT retry on close code 4004.** Token revocation is not transient — retrying with an invalid token would trigger Discord's abuse detection. The bot immediately marks the connection as `error` and stops retry attempts for this tenant.

### 5.5 Discord Gateway Disconnection (Transient)

Close codes that indicate a **transient** error (bot should retry):

| Close Code | Meaning | Bot Behavior |
|-----------|---------|-------------|
| 4000 | Unknown error | Retry with exponential backoff |
| 4001 | Unknown opcode | Retry |
| 4002 | Decode error | Retry |
| 4003 | Not authenticated | Session resume or reconnect |
| 4005 | Already authenticated | Ignore, reconnect |
| 4007 | Invalid seq | Full reconnect (no resume) |
| 4008 | Rate limited | Wait 30s then reconnect |
| 4009 | Session timed out | Full reconnect |
| Network error / timeout | Connection dropped | Retry after 5s, then 15s, then 30s |

**Exponential backoff schedule:**

| Attempt | Delay |
|---------|-------|
| 1 | 5 seconds |
| 2 | 15 seconds |
| 3 | 30 seconds |
| 4 | 60 seconds |
| 5+ | 120 seconds (max) |

After 10 failed reconnection attempts over 30+ minutes:

```
Bot updates discord_connections:
  - status = 'error'
  - error_message = 'Connection failed after 10 attempts. Last error: {error description}. Please check that your bot token is still valid.'
```

Close codes that indicate a **permanent** error (do NOT retry):

| Close Code | Meaning | Bot Behavior |
|-----------|---------|-------------|
| 4004 | Authentication failed (bad token) | Set status='error', DO NOT retry |
| 4010 | Invalid shard | Set status='error', message: "Invalid shard configuration." |
| 4011 | Sharding required | Set status='error', message: "Bot is in too many servers for non-sharded mode." |
| 4012 | Invalid API version | Set status='error', message: "Incompatible Discord API version. Contact Daimon support." |
| 4013 | Invalid intents | Set status='error', message: "Invalid gateway intents. Contact Daimon support." |
| 4014 | Disallowed intents | Set status='error', message: "Bot is missing required privileged intents. Enable Message Content Intent in the Discord Developer Portal: Applications → [Your App] → Bot → Privileged Gateway Intents → Message Content Intent." |

### 5.6 Disallowed Intents (Close Code 4014) — Most Common Error

This is the most frequent error new users encounter. Discord requires bots that read message content to enable the **Message Content privileged intent** in their Developer Portal.

**Symptoms:** Bot connects briefly then disconnects with close code 4014.

**Discord Developer Portal path:**
1. Go to `discord.com/developers/applications`
2. Select the bot application
3. Click "Bot" in left sidebar
4. Scroll to "Privileged Gateway Intents"
5. Enable: "Message Content Intent"
6. Save Changes

**Error message shown in Daimon dashboard:**
```
Bot is missing required privileged intents.

The "Message Content Intent" must be enabled in the Discord Developer Portal:
1. Go to discord.com/developers/applications
2. Select your application
3. Click "Bot" in the sidebar
4. Under "Privileged Gateway Intents", enable "Message Content Intent"
5. Save Changes

After enabling, click "Reconnect" below.
```

**UI action button:** "Reconnect" — triggers `POST /api/discord/reconnect/:connection_id` which sets `status = 'pending'` (clearing the error), causing the Realtime event to trigger the bot to retry connection.

### 5.7 Bot Invited to Wrong Guild

This is detected after connection. The bot connects to the Discord gateway successfully (token is valid), but the guild does not exist or the bot has not been invited.

```
Bot connects to Discord gateway (status = 'connecting' → WebSocket open)
  ↓
discord.py fires on_ready
  ↓
Bot checks: guild = client.get_guild(int(guild_id))
  ↓
If guild is None (bot not in the guild):
  Bot updates discord_connections:
    - status = 'error'
    - error_message = "Bot is not a member of guild {guild_id}. Please invite the bot to your Discord server using this link: https://discord.com/oauth2/authorize?client_id={bot_user_id}&scope=bot&permissions=2048"
  Bot logs warning, marks connection error
  ↓
Dashboard shows error with invite link
```

**Note:** The invite link `https://discord.com/oauth2/authorize?client_id={bot_user_id}&scope=bot&permissions=2048` is constructed using `bot_user_id` (from `discord_connections.bot_user_id`, populated when the token was first validated). The `permissions=2048` corresponds to the "Send Messages" permission. Additional permissions needed:
- `2048` — Send Messages
- `65536` — Read Message History
- `131072` — Use Slash Commands (if slash commands are added later)
- `274877906944` — Message Content (intent-based, not permission-based, but listed here for completeness)

**Combined permissions integer for invite:** `2048 + 65536 + 131072 = 198656`

**Full invite URL template:**
```
https://discord.com/oauth2/authorize?client_id={bot_user_id}&scope=bot+applications.commands&permissions=198656
```

### 5.8 Account Suspended (Admin Action)

```
Admin in /admin/tenants/[tenant_id] clicks "Suspend Account"
  ↓
API route sets tenants.status = 'suspended'
  ↓
Realtime event fires on tenants table UPDATE
  ↓
Bot's TenantConnectionManager._on_tenant_status_changed() receives event
  ↓
If new status == 'suspended':
  - Bot calls client.close() for all this tenant's connections
  - Bot updates discord_connections: status = 'suspended' for all rows
  ↓
No reconnection is attempted for suspended tenants
  ↓
If tenant is later unsuspended (admin sets tenants.status = 'configured'):
  - Realtime event fires
  - Bot picks up tenant again and sets discord_connections.status = 'pending'
  - Initiates reconnection
```

### 5.9 Plan Downgrade — Connection Count Reduction

```
Tenant on Starter plan (3 connections allowed) downgrades to Free (1 connection allowed)
  ↓
Stripe webhook fires customer.subscription.updated
  ↓
Webhook handler updates tenants.plan = 'free'
  ↓
If tenant has more connections than new plan allows:
  - Count active connections: SELECT COUNT(*) FROM discord_connections WHERE tenant_id = $id AND status != 'disconnected'
  - If count > 1 (free limit):
    - Keep the oldest connection (ORDER BY created_at ASC LIMIT 1)
    - Set excess connections status = 'suspended' with error_message = "Connection suspended due to plan downgrade. Upgrade to Starter or Pro to reconnect."
  ↓
Bot receives Realtime UPDATE events for the newly-suspended connections
Bot disconnects excess connections
  ↓
Dashboard shows suspended connection(s) with upgrade CTA
```

---

## 6. UI Error Messages — Complete List

All error messages related to Discord token/connection handling, organized by where they appear.

### 6.1 Modal/Form Inline Errors (Client-Side Validation)

| Trigger | Field | Error Message |
|---------|-------|--------------|
| Token field empty, blur | Token input | "Bot token is required." |
| Token format invalid, blur | Token input | "This doesn't look like a valid Discord bot token. Make sure you copied the token from the Discord Developer Portal, not the application's Client ID or Client Secret." |
| Token has "Bot " prefix pasted | Token input | Auto-stripped silently (no error — prefix is removed and validation proceeds) |
| Guild ID empty, blur | Guild ID input | "Guild ID is required." |
| Guild ID wrong format | Guild ID input | "Guild ID must be a 17–20 digit number. You can find it by right-clicking your server name in Discord and selecting 'Copy Server ID'. Enable Developer Mode in Discord settings if the option is not visible." |

### 6.2 Validation API Response Errors (Server-Side, Shown in Modal)

| Error Code | Display Message |
|-----------|----------------|
| `invalid_token_format` | "Bot token format is invalid. Copy the token from the Bot section of the Discord Developer Portal." |
| `invalid_guild_id_format` | "Guild ID must be a 17–20 digit number." |
| `invalid_token` | "Bot token is invalid or has been revoked. Regenerate the token in the Discord Developer Portal and paste the new one here." |
| `not_a_bot_token` | "This appears to be a user account token, not a bot token. You must use a bot token from the Bot section of the Discord Developer Portal." |
| `discord_rate_limited` | "Discord's API is temporarily rate limited. Please wait 60 seconds and try again." |
| `discord_unreachable` | "Could not reach Discord to validate your token. Check your connection and try again." |
| `discord_api_error` | "Discord returned an unexpected error while validating your token. Please try again in a moment." |
| `rate_limit_exceeded` | "Too many validation attempts. Please wait 10 minutes before trying again." |
| Server error (500) | "An unexpected error occurred. Please try again. If this persists, contact support at support@daimon.ai." |

### 6.3 Connection Status Error Messages (Dashboard / Settings Card)

| Scenario | Status Badge | Error Card Text |
|---------|-------------|----------------|
| Close code 4004 (bad token) | "Error" (red) | "Bot token has been invalidated. Regenerate your token in the Discord Developer Portal and update it here. [Replace Token button]" |
| Close code 4014 (intents) | "Error" (red) | "Bot is missing required privileged intents. Enable 'Message Content Intent' in your Discord Developer Portal: Applications → [Your App] → Bot → Privileged Gateway Intents → Message Content Intent → Save Changes. [Reconnect button]" |
| Bot not in guild | "Error" (red) | "Bot is not a member of your Discord server. [Invite Bot button — opens Discord OAuth invite URL in new tab]" |
| 10 failed reconnection attempts | "Error" (red) | "Connection failed after multiple attempts. Last error: {error_message from DB}. Check that your bot token is still valid. [Replace Token button] [Reconnect button]" |
| Status = 'suspended' (plan) | "Suspended" (orange) | "This connection was suspended because your plan allows only {N} connection(s). [Upgrade button]" |
| Status = 'suspended' (admin) | "Suspended" (orange) | "This connection has been suspended by an administrator. Contact support at support@daimon.ai." |
| Status = 'connecting' (> 60s) | "Connecting..." (blue animated) | No error card; spinner shown |
| Status = 'disconnected' | "Disconnected" (gray) | "This connection has been disconnected. [Reconnect button]" |

### 6.4 Toast Notifications

| Action | Success Toast | Error Toast |
|--------|-------------|------------|
| Add new connection | "Bot connected successfully!" (3s, green) | "Failed to save connection. Please try again." (5s, red) |
| Replace token | "Bot token updated. Reconnecting..." (3s, green) | "Failed to update token. Please try again." (5s, red) |
| Disconnect | "Bot disconnected." (3s, gray) | "Failed to disconnect. Please try again." (5s, red) |
| Reconnect | "Reconnecting bot..." (3s, blue) | "Failed to reconnect. Please try again." (5s, red) |

---

## 7. API Routes — Discord Connection CRUD

All routes require the user to be authenticated (Supabase session cookie) and a member of the tenant with role 'owner' or 'admin'.

### 7.1 `POST /api/discord/validate-token`

**Purpose:** Validate format and call Discord API to verify token is active.
**Auth:** Any authenticated user (no tenant role requirement — this is a prerequisite step before creating a connection).
**Rate limit:** 10 requests per tenant per 10 minutes.

See §3 above for full request/response spec.

### 7.2 `POST /api/discord-connections`

**Purpose:** Create a new discord_connections row after successful validation.
**Auth:** Authenticated user, role = 'owner' or 'admin' in the tenant.

**Request:**

```
POST /api/discord-connections
Authorization: Bearer {supabase_jwt}
Content-Type: application/json

{
  "token": "...",
  "guild_id": "1234567890123456789",
  "bot_user_id": "9876543210987654321",
  "bot_username": "MyBotName"
}
```

**Processing:**

```
1. Auth check: verify user session, get tenant_id from tenant_members
2. Re-validate token format (server-side defense in depth)
3. Re-validate guild_id format
4. Check plan limit:
   - Free: max 1 connection
   - Starter: max 3 connections
   - Pro: unlimited
   - Query: SELECT COUNT(*) FROM discord_connections
     WHERE tenant_id = $tenant_id AND status NOT IN ('disconnected', 'suspended')
   - If at limit: return 403 with limit_exceeded error
5. Check for duplicate guild:
   SELECT id FROM discord_connections WHERE tenant_id = $tenant_id AND guild_id = $guild_id
   If exists: return 409 "A connection to this Discord server already exists."
6. Store token in Vault: vault.create_secret(token, name, description)
7. Insert discord_connections row
8. Update tenants.status to 'configured' if currently 'pending' and this is the first connection
   (only if tenant_api_keys for 'anthropic' also exists)
9. Return created connection (id, guild_id, status, bot_user_id, bot_username, created_at)
   — vault_secret_id and vault contents are NEVER returned
```

**Success response (201):**

```json
{
  "id": "uuid",
  "guild_id": "1234567890123456789",
  "status": "pending",
  "bot_user_id": "9876543210987654321",
  "bot_username": "MyBotName",
  "created_at": "2026-03-13T10:00:00Z"
}
```

**Error responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `unauthorized` | "Authentication required." |
| 403 | `insufficient_role` | "Only workspace owners and admins can add Discord connections." |
| 403 | `plan_limit_exceeded` | "Your plan allows a maximum of {N} Discord connection(s). Upgrade to add more." |
| 409 | `duplicate_guild` | "A connection to this Discord server already exists. Update the existing connection instead." |
| 400 | `invalid_token_format` | "Bot token format is invalid." |
| 400 | `invalid_guild_id_format` | "Guild ID must be a 17–20 digit number." |
| 500 | `vault_error` | "Failed to store credentials securely. Please try again." |

### 7.3 `PATCH /api/discord-connections/:id`

**Purpose:** Update the bot token for an existing connection (token replacement).
**Auth:** Owner or admin role.

**Request:**

```
PATCH /api/discord-connections/{connection_id}
Authorization: Bearer {supabase_jwt}
Content-Type: application/json

{
  "token": "NEW_TOKEN_HERE",
  "bot_user_id": "9876543210987654321",
  "bot_username": "MyBotName"
}
```

**Note:** `guild_id` is NOT updateable via PATCH. Only the token can be replaced.

**Processing:**

```
1. Auth check and ownership verification
2. Fetch existing connection: SELECT id, tenant_id, vault_secret_id FROM discord_connections WHERE id = $id
3. Verify tenant_id matches authenticated user's tenant
4. Re-validate new token format
5. Create new Vault secret with new token
6. UPDATE discord_connections SET vault_secret_id = new_secret_id, status = 'pending', bot_user_id = $new, bot_username = $new, error_message = NULL
7. Delete old Vault secret: vault.delete_secret(old_vault_secret_id)
8. Realtime UPDATE event fires → bot reconnects
9. Return updated connection
```

**Success response (200):**

```json
{
  "id": "uuid",
  "guild_id": "1234567890123456789",
  "status": "pending",
  "bot_user_id": "9876543210987654321",
  "bot_username": "MyBotName",
  "updated_at": "2026-03-13T10:05:00Z"
}
```

**Error responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `unauthorized` | "Authentication required." |
| 403 | `insufficient_role` | "Only workspace owners and admins can update Discord connections." |
| 404 | `not_found` | "Discord connection not found." |
| 400 | `invalid_token_format` | "Bot token format is invalid." |
| 500 | `vault_error` | "Failed to store credentials securely. Please try again." |

### 7.4 `DELETE /api/discord-connections/:id`

**Purpose:** Disconnect and delete a Discord connection.
**Auth:** Owner or admin role.

**Request:**

```
DELETE /api/discord-connections/{connection_id}
Authorization: Bearer {supabase_jwt}
```

**Processing:**

```
1. Auth check and ownership verification
2. Fetch connection: SELECT id, tenant_id, vault_secret_id FROM discord_connections WHERE id = $id
3. Verify tenant_id matches user's tenant
4. UPDATE discord_connections SET status = 'disconnected' (triggers Realtime → bot disconnects)
5. Wait max 3 seconds for bot to acknowledge (poll discord_connections.status for 'disconnected')
   — If no ack in 3s, proceed anyway
6. DELETE FROM discord_connections WHERE id = $id
7. vault.delete_secret(vault_secret_id)
8. If tenant has zero remaining active connections and status was 'active':
   UPDATE tenants SET status = 'configured'
9. Return 204 No Content
```

**Error responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `unauthorized` | "Authentication required." |
| 403 | `insufficient_role` | "Only workspace owners and admins can disconnect Discord connections." |
| 404 | `not_found` | "Discord connection not found." |
| 500 | `delete_error` | "Failed to remove connection. Please try again." |

### 7.5 `POST /api/discord-connections/:id/reconnect`

**Purpose:** Trigger reconnection after an error (sets status back to 'pending').
**Auth:** Owner or admin role.

**Request:**

```
POST /api/discord-connections/{connection_id}/reconnect
Authorization: Bearer {supabase_jwt}
```

**Processing:**

```
1. Auth check
2. Verify connection belongs to authenticated tenant
3. Check current status — only allow reconnect if status IN ('error', 'disconnected', 'suspended')
   If status = 'connected': return 409 "Bot is already connected."
   If status = 'suspended' (plan): return 403 "Upgrade your plan to reconnect this bot."
   If status = 'suspended' (admin): return 403 "This connection has been suspended by an administrator."
4. UPDATE discord_connections SET status = 'pending', error_message = NULL
5. Realtime UPDATE event fires → bot picks up and attempts reconnection
6. Return 200 { "status": "pending" }
```

**Error responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `unauthorized` | "Authentication required." |
| 403 | `insufficient_role` | "Only workspace owners and admins can reconnect Discord connections." |
| 403 | `plan_suspended` | "Upgrade your plan to reconnect this bot." |
| 403 | `admin_suspended` | "This connection has been suspended by an administrator. Contact support." |
| 404 | `not_found` | "Discord connection not found." |
| 409 | `already_connected` | "Bot is already connected." |

---

## 8. Bot-Side Token Handling

### 8.1 Token Loading at Startup

The bot loads all active tenant connections at startup:

```python
# In TenantConnectionManager.start_all()
async def _load_active_connections(self) -> list[TenantConfig]:
    """Load all non-suspended connections from Supabase."""
    result = await self.supabase \
        .table('discord_connections') \
        .select('''
            id,
            tenant_id,
            guild_id,
            vault_secret_id,
            status,
            tenants!inner(id, plan, status),
            tenant_api_keys!inner(key_type, vault_secret_id, status)
        ''') \
        .not_('status', 'in', '("disconnected","suspended")') \
        .eq('tenants.status', 'active') \
        .neq('tenants.status', 'suspended') \
        .eq('tenant_api_keys.key_type', 'anthropic') \
        .eq('tenant_api_keys.status', 'active') \
        .execute()

    configs = []
    for row in result.data:
        # Decrypt Discord bot token
        discord_token = await self._decrypt_vault_secret(row['vault_secret_id'])
        # Decrypt Anthropic API key
        anthropic_key = await self._decrypt_vault_secret(
            row['tenant_api_keys'][0]['vault_secret_id']
        )
        configs.append(TenantConfig(
            connection_id=row['id'],
            tenant_id=row['tenant_id'],
            guild_id=row['guild_id'],
            discord_token=discord_token,
            anthropic_api_key=anthropic_key,
            plan=row['tenants']['plan'],
        ))
    return configs
```

### 8.2 Token Isolation in Memory

Each `TenantConfig` is a separate Python dataclass. The bot's `TenantConnectionManager` maintains a dictionary:

```python
# In TenantConnectionManager
_configs: dict[str, TenantConfig]           # connection_id → TenantConfig
_clients: dict[str, discord.Client]         # connection_id → discord.Client
```

**Isolation guarantee:** Each Discord client instance (`discord.Client`) has its own token. Tokens are never shared between `TenantConfig` objects. The dictionary key is `connection_id` (UUID), not tenant_id, to support multiple connections per tenant (starter/pro plans).

### 8.3 Token Hot-Reload on Update

When the user replaces their token:

```python
# In TenantConnectionManager._on_connection_updated()
async def _on_connection_updated(self, payload: dict):
    connection_id = payload['record']['id']
    new_vault_secret_id = payload['record']['vault_secret_id']
    new_status = payload['record']['status']

    if new_status == 'disconnected':
        await self.remove_tenant(connection_id)
        return

    if connection_id in self._configs:
        old_config = self._configs[connection_id]
        if old_config.vault_secret_id != new_vault_secret_id:
            # Token changed — hot reload
            new_token = await self._decrypt_vault_secret(new_vault_secret_id)
            await self.remove_tenant(connection_id)  # Disconnects old client
            new_config = TenantConfig(
                connection_id=connection_id,
                tenant_id=payload['record']['tenant_id'],
                guild_id=payload['record']['guild_id'],
                discord_token=new_token,
                anthropic_api_key=old_config.anthropic_api_key,  # unchanged
                plan=old_config.plan,  # unchanged
            )
            await self.add_tenant(new_config)  # Creates new client, connects
```

### 8.4 Heartbeat Writes

Every 30 seconds, for each connected client:

```python
# In TenantConnectionManager._heartbeat_loop()
async def _heartbeat_loop(self):
    while True:
        await asyncio.sleep(30)
        for connection_id, client in self._clients.items():
            if client.is_ready():
                await self.supabase \
                    .table('discord_connections') \
                    .update({'last_heartbeat': 'NOW()', 'status': 'connected'}) \
                    .eq('id', connection_id) \
                    .execute()
```

**Note:** The heartbeat UPDATE does NOT change `vault_secret_id`. This means the Realtime `_on_connection_updated()` handler will receive these UPDATE events but correctly takes the "no action needed" branch because `old.vault_secret_id == new.vault_secret_id` and `new.status != 'disconnected'`.

---

## 9. Security Properties

| Property | Implementation |
|---------|---------------|
| Token never in browser response | API routes return only `id`, `guild_id`, `status`, `bot_user_id`, `bot_username` — never `vault_secret_id` or decrypted token |
| Token encrypted at rest | AES-256 via Supabase Vault (`pgcrypto`) |
| Token decryption scope | Bot only (uses service role key) — website API routes call an Edge Function for Vault operations |
| Token validation before storage | Always call Discord API before inserting/updating — prevents storing known-bad tokens |
| Token stripped of "Bot " prefix | Done server-side before validation and storage |
| Vault secret cleanup on delete | Old secrets deleted when: (a) user replaces token, (b) user disconnects, (c) tenant account deleted |
| Guild ID format validation | Checked at both client-side (blur) and server-side (API route) |
| Rate limiting on validate endpoint | 10 attempts per tenant per 10 minutes — prevents token discovery via brute force |
| Token masked in UI | Token is never shown after save — bot is identified by `bot_username` only |
| No Discord OAuth for auth | Platform authentication is email/password only — Discord is integration, not identity provider |
| Connection count limits | Enforced at API route level (free=1, starter=3, pro=unlimited) — prevents abuse |
| Realtime bot token access | Bot receives Realtime events but never fetches raw token from Realtime payload — always reads from Vault on hot-reload |

---

## 10. Cross-References

| Topic | File |
|-------|------|
| `discord_connections` table full spec | [database/schema.md](../database/schema.md#table-discord_connections) |
| Vault encryption setup and patterns | [database/vault-encryption.md](../database/vault-encryption.md) |
| Bot multi-tenant connection manager | [multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md) |
| Realtime channel config for bot events | [multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) |
| Settings page Discord section (UI) | [frontend/settings-page.md](../frontend/settings-page.md#section-2-discord-connection) |
| Discord connection add/validate modal | [frontend/integrations-page.md](../frontend/integrations-page.md) |
| Rate limiting configuration | [api/rate-limiting.md](../api/rate-limiting.md) |
| All Discord-related copy strings | [frontend/copy.md](../frontend/copy.md) |
| Premium plan connection limits | [premium/tiers.md](../premium/tiers.md) |
| Health monitoring for stale heartbeats | [multi-tenant/health-monitoring.md](../multi-tenant/health-monitoring.md) |
