# Settings Page — Complete Specification

> Route: `/dashboard/settings`
> Layout: `app/(dashboard)/layout.tsx` — Authenticated only
> File: `app/(dashboard)/settings/page.tsx` (Server Component, data fetched server-side)
> Last updated: 2026-03-13

---

## Overview

The Settings page allows tenants to configure their workspace, manage Discord bot connections, manage team members (future: invite additional seats), update their personal account, and perform destructive operations such as deleting the workspace. It is divided into five sections rendered as stacked card panels:

1. **Workspace** — Tenant name (editable), workspace ID (read-only), creation date
2. **Discord Connection** — Add, view, reconnect, and remove Discord bot connections
3. **Team Members** — View current members and their roles (invite deferred to future release)
4. **Account** — Display name, email (read-only), password change
5. **Danger Zone** — Delete Workspace (owner only)

**Auth guard:** Middleware (`middleware.ts`) redirects unauthenticated requests to `/login?next=/dashboard/settings`.

**Role restrictions:**

| Section | Owner | Admin | Member |
|---------|-------|-------|--------|
| Workspace — view name/ID | ✓ | ✓ | ✓ |
| Workspace — edit name | ✓ | ✓ | ✗ |
| Discord Connection — view | ✓ | ✓ | ✓ |
| Discord Connection — add/update/remove | ✓ | ✓ | ✗ |
| Team Members — view | ✓ | ✓ | ✓ |
| Team Members — invite (future) | ✓ | ✗ | ✗ |
| Team Members — change role (future) | ✓ | ✗ | ✗ |
| Team Members — remove member (future) | ✓ | ✗ | ✗ |
| Account — view | ✓ | ✓ | ✓ |
| Account — update display name | ✓ | ✓ | ✓ |
| Account — change password | ✓ | ✓ | ✓ |
| Danger Zone — visible | ✓ | ✗ | ✗ |
| Danger Zone — delete workspace | ✓ | ✗ | ✗ |

Disabled buttons are rendered with `opacity: 0.4` and `cursor: not-allowed`. Member/admin users see a tooltip on hover of disabled buttons: "Only the workspace owner can perform this action."

**No real-time updates on this page:** Settings data does not require real-time updates. Server-side rendered once on load. After mutations, the page re-fetches via `router.refresh()` to show updated values.

---

## Layout Structure

Settings page uses the standard Dashboard Shell (sidebar + topbar + main content area). See [dashboard.md](./dashboard.md) for full shell spec.

```
<main class="page-content">                <!-- p-8 -->
  <PageHeader />                            <!-- Title + subtitle -->
  <SettingsSections />                     <!-- Stacked card panels, gap-6 -->
    <WorkspaceSection />
    <DiscordConnectionSection />
    <TeamMembersSection />
    <AccountSection />
    <DangerZoneSection />                  <!-- Owner only — hidden for admin/member -->
</main>
```

---

## Page Header

```html
<div class="page-header" style="margin-bottom: 32px;">
  <h1>Settings</h1>
  <p class="subtitle">
    Manage your workspace configuration and account preferences.
  </p>
</div>
```

| Property | Value |
|----------|-------|
| `h1` font | Archivo SemiBold, 28px, #0C1F40 (Navy) |
| `h1` margin-bottom | 8px |
| Subtitle font | Inter Regular, 14px, #6B7280 (Gray 500) |
| Subtitle max-width | 640px |
| Header margin-bottom | 32px |

---

## Section Card Component

Every section is rendered as a card panel. All sections use this exact structure:

```html
<div class="settings-card">
  <div class="settings-card-header">
    <h2>Section Title</h2>
    <p class="section-subtitle">Optional subtitle text.</p>
  </div>
  <div class="settings-card-body">
    <!-- Section-specific content -->
  </div>
</div>
```

| Property | Value |
|----------|-------|
| Card background | White (`#FFFFFF`) |
| Card border | `1px solid #E5E7EB` (Gray 200) |
| Card border-radius | `0px` (sharp corners — PyMC brand rule) |
| Card padding | `0` (header and body have their own padding) |
| Card margin-bottom | `24px` |
| Header padding | `24px 32px 20px 32px` |
| Header border-bottom | `1px solid #E5E7EB` |
| `h2` font | Archivo SemiBold, 18px, #0C1F40 (Navy) |
| `h2` margin-bottom | 4px (when subtitle present), 0 (when no subtitle) |
| Section subtitle font | Inter Regular, 14px, #6B7280 (Gray 500) |
| Body padding | `24px 32px 32px 32px` |

---

## Section 1: Workspace

### Purpose

Displays and allows editing of the workspace name. Shows the workspace ID (used for support requests) and creation date as read-only metadata.

### Data Fetching

Fetched server-side in the page component:

```typescript
// Query 1: Tenant metadata
const { data: tenant } = await supabase
  .from('tenants')
  .select('id, name, created_at')
  .eq('id', tenantId)
  .single();

// Query 2: Current user role
const { data: membership } = await supabase
  .from('tenant_members')
  .select('role')
  .eq('tenant_id', tenantId)
  .eq('user_id', userId)
  .single();
```

### Layout

```
<WorkspaceSection>
  <header>Workspace</header>
  <body>
    <WorkspaceNameForm />        <!-- Editable field + Save button -->
    <WorkspaceMetadata />        <!-- Workspace ID + Created date (read-only) -->
  </body>
</WorkspaceSection>
```

### Workspace Name Form

```html
<form id="workspace-name-form" action="/api/settings/workspace" method="POST">
  <div class="form-group">
    <label for="workspace-name">Workspace Name</label>
    <div class="input-row">
      <input
        id="workspace-name"
        name="name"
        type="text"
        value="{tenant.name}"
        maxlength="100"
        required
        aria-label="Workspace name"
        aria-describedby="workspace-name-hint"
        [disabled if role === 'member']
      />
      <button type="submit" [disabled if role === 'member']>Save</button>
    </div>
    <p id="workspace-name-hint" class="field-hint">
      Between 1 and 100 characters.
    </p>
  </div>
</form>
```

**Field specifications:**

| Property | Value |
|----------|-------|
| Label text | "Workspace Name" |
| Label font | Inter Medium, 14px, #374151 (Gray 700) |
| Label margin-bottom | 6px |
| Input type | `text` |
| Input width | `320px` (desktop), `100%` (mobile, below 640px) |
| Input height | `40px` |
| Input padding | `10px 12px` |
| Input font | Inter Regular, 14px, #111827 (Gray 900) |
| Input background | White (`#FFFFFF`) |
| Input border | `1px solid #D1D5DB` (Gray 300) |
| Input border-radius | `0px` |
| Input:focus border | `1px solid #0C1F40` (Navy) |
| Input:focus outline | `none` |
| Input:focus box-shadow | `0 0 0 3px rgba(180, 231, 221, 0.4)` (Aqua 40%) |
| Input[disabled] background | `#F9FAFB` (Gray 50) |
| Input[disabled] border | `1px solid #E5E7EB` |
| Input[disabled] color | `#9CA3AF` (Gray 400) |
| Placeholder | None (pre-filled with current value) |
| maxlength | `100` |
| Hint font | Inter Regular, 12px, #6B7280 (Gray 500) |
| Hint margin-top | `6px` |
| Input-row gap | `12px` (between input and Save button) |
| Input-row layout | `flex, align-items: center` |

**Save button (`workspace-name-save`):**

| Property | Value |
|----------|-------|
| Label | "Save" |
| Font | Inter SemiBold, 14px |
| Background | Aqua (`#B4E7DD`) |
| Text color | Navy (`#0C1F40`) |
| Height | `40px` |
| Padding | `0 20px` |
| Border-radius | `0px` |
| Border | None |
| Hover background | `#9ED8CE` (Aqua darkened 8%) |
| Disabled background | Aqua (`#B4E7DD`) |
| Disabled opacity | `0.4` |
| Disabled cursor | `not-allowed` |
| Loading state | Shows spinner (16px, Navy) in place of label text |
| Min-width | `80px` (prevents width change during loading) |

**Validation rules:**

| Rule | Error Message | Where Shown |
|------|--------------|-------------|
| Required (empty) | "Workspace name is required." | Inline below input (red, 12px Inter, #EF4444) |
| Too long (> 100 chars) | "Workspace name must be 100 characters or less." | Inline below input |
| No change from current | Button stays disabled (grey) — no submission occurs | N/A (button state) |
| Server error (unexpected) | Toast: "Failed to save workspace name. Please try again." | Toast (error, 4s) |
| Success | Toast: "Workspace name updated." | Toast (success, 3s) |

**onChange behavior:** The Save button is disabled when the input value matches the current tenant name. It becomes enabled as soon as the value differs AND is not empty.

**API call:**
```
POST /api/settings/workspace
Content-Type: application/json
Body: { "name": "New Workspace Name" }
Response 200: { "success": true }
Response 400: { "error": "Workspace name is required." }
Response 403: { "error": "Only workspace owners and admins can update workspace settings." }
```

### Workspace Metadata

Below the form, rendered as a two-column definition list:

```html
<dl class="workspace-metadata">
  <div class="metadata-row">
    <dt>Workspace ID</dt>
    <dd>
      <span class="monospace">{tenant.id}</span>
      <button class="copy-btn" aria-label="Copy workspace ID" data-copy="{tenant.id}">
        <!-- Copy icon, 14px -->
      </button>
    </dd>
  </div>
  <div class="metadata-row">
    <dt>Created</dt>
    <dd>{formatted date: "March 5, 2026"}</dd>
  </div>
</dl>
```

| Property | Value |
|----------|-------|
| `dl` margin-top | `24px` |
| `dl` padding-top | `24px` |
| `dl` border-top | `1px solid #E5E7EB` |
| Metadata row layout | `flex, gap: 16px, align-items: center` |
| Metadata row padding | `8px 0` |
| `dt` font | Inter Medium, 13px, #6B7280 (Gray 500) |
| `dt` min-width | `140px` |
| `dd` font | Inter Regular, 13px, #111827 (Gray 900) |
| Monospace span font | `font-family: 'Courier New', monospace`, 12px, #111827 |
| Copy button background | Transparent |
| Copy button padding | `4px` |
| Copy button margin-left | `8px` |
| Copy button icon | Clipboard icon, 14px, #6B7280 |
| Copy button:hover icon color | Navy (`#0C1F40`) |
| Copy button:focus outline | `2px solid #B4E7DD` (Aqua) |

**Copy button behavior:**
1. User clicks copy icon next to Workspace ID
2. `navigator.clipboard.writeText(tenant.id)` is called
3. Icon changes to a checkmark (✓) for 2 seconds
4. Icon reverts to clipboard icon after 2 seconds
5. No toast notification (icon feedback is sufficient)

**Date format:** Full month name + day + 4-digit year. Use `new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(tenant.created_at))`. Example: "March 5, 2026".

---

## Section 2: Discord Connection

### Purpose

Allows tenants to manage their Discord bot connection(s). Users paste their bot token and guild ID here. The number of allowed connections depends on the plan:

| Plan | Max Connections |
|------|----------------|
| free | 1 |
| starter | 3 |
| pro | Unlimited (no enforced limit; display "Unlimited") |

### Data Fetching

```typescript
// Query: Discord connections for this tenant
const { data: connections } = await supabase
  .from('discord_connections')
  .select('id, guild_id, bot_username, bot_user_id, status, last_heartbeat, error_message, created_at')
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: true });

// Query: Current plan (for connection limit enforcement)
const { data: tenant } = await supabase
  .from('tenants')
  .select('plan')
  .eq('id', tenantId)
  .single();
```

### Layout

```
<DiscordConnectionSection>
  <header>Discord Connection</header>
  <body>
    <ConnectionList />        <!-- 0..N existing connection rows -->
    <AddConnectionForm />     <!-- Hidden if at plan limit; collapsible -->
  </body>
</DiscordConnectionSection>
```

### Connection List

Each existing connection is rendered as a row:

```html
<div class="connection-row">
  <div class="connection-icon">
    <!-- Discord logo SVG, 32x32 -->
  </div>
  <div class="connection-info">
    <div class="connection-title">
      {bot_username || "Unnamed Bot"}
      <span class="guild-id-label">Guild {guild_id}</span>
    </div>
    <div class="connection-meta">
      <StatusBadge status="{effective_status}" />
      {#if last_heartbeat}
        <span class="last-seen">Last seen {relative_time}</span>
      {/if}
      {#if status === 'error' && error_message}
        <span class="error-message">{error_message}</span>
      {/if}
    </div>
  </div>
  <div class="connection-actions">
    <button class="btn-outline" [disabled if member role]>Update Token</button>
    <button class="btn-danger-outline" [disabled if member role]>Remove</button>
  </div>
</div>
```

**Effective status display:**

The `effective_status` for display is computed from `status` + `last_heartbeat`:

| Condition | Display Label | Badge Color |
|-----------|--------------|-------------|
| `status = 'connected'` AND `last_heartbeat` within 3 min | "Connected" | Aqua background (`#B4E7DD`), Navy text |
| `status = 'connected'` AND `last_heartbeat` more than 3 min ago | "Stale" | `#FEF3C7` (Yellow 50) background, `#92400E` (Yellow 800) text |
| `status = 'connecting'` | "Connecting…" | `#DBEAFE` (Blue 50) background, `#1E40AF` (Blue 800) text |
| `status = 'pending'` | "Pending" | `#F3F4F6` (Gray 100) background, `#6B7280` text |
| `status = 'error'` | "Error" | `#FEE2E2` (Red 50) background, `#991B1B` (Red 800) text |
| `status = 'disconnected'` | "Disconnected" | `#F3F4F6` background, `#6B7280` text |
| `status = 'suspended'` | "Suspended" | `#F3F4F6` background, `#6B7280` text |

**Badge specs:**
| Property | Value |
|----------|-------|
| Height | `22px` |
| Padding | `2px 8px` |
| Font | Inter Medium, 12px |
| Border-radius | `0px` |
| Display | `inline-flex, align-items: center` |

**Connection row specs:**
| Property | Value |
|----------|-------|
| Layout | `flex, align-items: center, gap: 16px` |
| Padding | `16px 0` |
| Border-bottom | `1px solid #E5E7EB` (except last row) |
| Discord icon container | `32x32px, flex-shrink: 0` |
| `connection-info` flex | `flex: 1, min-width: 0` |
| Bot username font | Inter SemiBold, 14px, #111827 |
| Guild ID label font | Inter Regular, 12px, #6B7280 (Gray 500) |
| Guild ID label margin-left | `8px` |
| Last seen font | Inter Regular, 12px, #6B7280 |
| Last seen margin-left | `8px` |
| Error message font | Inter Regular, 12px, #EF4444 (Red 500) |
| Error message margin-left | `8px` |

**Relative time format for "Last seen":** Use a utility function:
```typescript
function relativeTime(ts: Date | null): string {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - ts.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

**"Update Token" button:**
- Label: "Update Token"
- Style: outlined, Navy border, Navy text, transparent background
- Hover: Navy background, White text
- Disabled: opacity 0.4, cursor not-allowed
- Action: Opens the **Update Token Modal** (inline modal within the settings page)
- Tooltip when disabled (member role): "Only the workspace owner or admin can update the bot token."

**"Remove" button:**
- Label: "Remove"
- Style: outlined, Red-600 (#DC2626) border, Red-600 text, transparent background
- Hover: Red-600 background, White text
- Disabled: opacity 0.4, cursor not-allowed
- Action: Opens the **Remove Connection Confirmation Dialog**
- Tooltip when disabled (member role): "Only the workspace owner or admin can remove connections."

**Empty state (no connections):**

```html
<div class="empty-state">
  <p>No Discord connection yet.</p>
  <p>Add your bot token and guild ID to activate your bot.</p>
</div>
```

| Property | Value |
|----------|-------|
| Container padding | `32px 0` |
| Text align | Center |
| First line font | Inter Medium, 14px, #374151 (Gray 700) |
| Second line font | Inter Regular, 13px, #6B7280 (Gray 500) |
| Second line margin-top | `4px` |

### Plan Limit Banner

When the connection count equals the plan maximum, display a banner above the "Add Connection" form (which is hidden):

```html
<div class="plan-limit-banner">
  <span>You've reached the limit for your plan (1 connection on Free).</span>
  <a href="/dashboard/billing">Upgrade to add more →</a>
</div>
```

| Property | Value |
|----------|-------|
| Background | `#FEF3C7` (Yellow 50) |
| Border | `1px solid #FDE68A` (Yellow 200) |
| Padding | `12px 16px` |
| Font | Inter Regular, 14px, #92400E (Yellow 800) |
| Link color | Navy (`#0C1F40`) |
| Link font-weight | SemiBold |
| Margin-top | `16px` |
| Display | Hidden when under limit; visible when at or over limit |

### Add Connection Form

Visible when the connection count is below the plan maximum. Collapsed by default when at least one connection exists; expanded by default when zero connections exist.

```html
<div class="add-connection-wrapper">
  <!-- Toggle button (shown only when connections exist) -->
  <button class="add-connection-toggle" [hidden if no connections]>
    + Add Another Connection
  </button>

  <!-- Collapsible form (always visible when no connections) -->
  <form id="add-connection-form" [collapsed if connections exist and toggle not clicked]>
    <div class="form-group">
      <label for="bot-token">Bot Token</label>
      <input
        id="bot-token"
        name="bot_token"
        type="password"
        placeholder="Paste your Discord bot token"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        required
      />
      <p class="field-hint">
        Find this in the Discord Developer Portal under Bot → Token.
        <a href="https://discord.com/developers/applications" target="_blank" rel="noopener">Open Developer Portal →</a>
      </p>
    </div>
    <div class="form-group">
      <label for="guild-id">Guild (Server) ID</label>
      <input
        id="guild-id"
        name="guild_id"
        type="text"
        placeholder="e.g., 1234567890123456789"
        pattern="[0-9]{17,20}"
        required
      />
      <p class="field-hint">
        Right-click your server in Discord → Copy Server ID.
        Developer Mode must be enabled in Discord settings.
      </p>
    </div>
    <div class="form-actions">
      <button type="submit" id="add-connection-submit">Connect Bot</button>
      <button type="button" id="add-connection-cancel" [hidden if no connections]>Cancel</button>
    </div>
  </form>
</div>
```

**"+ Add Another Connection" toggle button:**

| Property | Value |
|----------|-------|
| Font | Inter SemiBold, 14px, #0C1F40 (Navy) |
| Background | Transparent |
| Border | `1px solid #0C1F40` |
| Padding | `8px 16px` |
| Border-radius | `0px` |
| Hover background | `#0C1F40` |
| Hover color | White |
| Margin-top | `16px` |
| Action | Expands form inline; button disappears while form is visible |

**Form field specs (Bot Token input):**

| Property | Value |
|----------|-------|
| Label | "Bot Token" |
| Input type | `password` (masks the token) |
| Input width | `100%` |
| Input height | `40px` |
| Input padding | `10px 12px` |
| Input font | Inter Regular, 14px, #111827 (monospace display for tokens would be ideal but Inter is fine) |
| Input border | `1px solid #D1D5DB` |
| Input border-radius | `0px` |
| Input:focus border | `1px solid #0C1F40` |
| Input:focus box-shadow | `0 0 0 3px rgba(180, 231, 221, 0.4)` |
| Placeholder color | #9CA3AF (Gray 400) |
| Hint font | Inter Regular, 12px, #6B7280 |
| Hint margin-top | `6px` |
| Hint link color | Navy (`#0C1F40`) |
| autocomplete | `"off"` |
| spellcheck | `false` |

**Form field specs (Guild ID input):**

| Property | Value |
|----------|-------|
| Label | "Guild (Server) ID" |
| Input type | `text` |
| Input width | `100%` |
| Input height | `40px` |
| Placeholder | "e.g., 1234567890123456789" |
| Pattern | `[0-9]{17,20}` (Discord snowflake IDs are 17–20 digits) |
| Hint font | Inter Regular, 12px, #6B7280 |
| All other styles | Same as Bot Token input |

**Form validation rules (Add Connection):**

| Field | Rule | Error Message | Where Shown |
|-------|------|--------------|-------------|
| Bot Token | Required | "Bot token is required." | Inline below field (red, 12px Inter, #EF4444) |
| Bot Token | Client format | Token starts with valid Discord bot token prefix (MTxx, Mzxx, Nzxx, OD…). Pattern: starts with a base64 segment, period, then more base64. Client-side regex: `/^[A-Za-z0-9_\-]{23,28}\.[A-Za-z0-9_\-]{6}\.[A-Za-z0-9_\-]{27,38}$/`. | "That doesn't look like a valid Discord bot token." |
| Bot Token | Server: token invalid | API validates by attempting a GET to Discord `/api/v10/users/@me` with the token | "Discord rejected this token. Double-check it in the Developer Portal." |
| Bot Token | Server: token already used | Another tenant's connection has this token | "This bot token is already in use. Each bot can only be connected to one workspace." |
| Guild ID | Required | "Guild ID is required." | Inline below field |
| Guild ID | Pattern (non-numeric or wrong length) | "Guild ID must be a 17–20 digit number." | Inline below field |
| Guild ID | Server: guild already connected | Another connection (same tenant) has this guild | "This server is already connected. Remove the existing connection first." |
| Network/server error | — | "Failed to add connection. Please try again." | Toast (error, 4s) |

**"Connect Bot" submit button:**

| Property | Value |
|----------|-------|
| Label default | "Connect Bot" |
| Label loading | Shows spinner (16px Navy) — label hidden |
| Font | Inter SemiBold, 14px |
| Background | Aqua (`#B4E7DD`) |
| Text color | Navy (`#0C1F40`) |
| Height | `40px` |
| Padding | `0 24px` |
| Border-radius | `0px` |
| Hover background | `#9ED8CE` |
| Disabled | opacity 0.4, cursor not-allowed |
| Min-width | `140px` |

**"Cancel" button:**

| Property | Value |
|----------|-------|
| Label | "Cancel" |
| Font | Inter Regular, 14px, #6B7280 |
| Background | Transparent |
| Border | None |
| Hover color | #374151 |
| Height | `40px` |
| Padding | `0 16px` |
| Action | Collapses form; shows "+ Add Another Connection" toggle again |

**Form actions layout:**
| Property | Value |
|----------|-------|
| Layout | `flex, gap: 12px, align-items: center, margin-top: 20px` |
| Button order | "Connect Bot" first, "Cancel" second |

**Success flow after "Connect Bot":**
1. Form submits to `POST /api/discord-connections`
2. Loading spinner shows on button (2–5s typical)
3. On success (HTTP 201): form collapses, new connection row appears in list with status "Pending", toast: "Bot connection added. Your bot will connect shortly."
4. Page re-fetches connection list after 3s to pick up status update from bot

**API call:**
```
POST /api/discord-connections
Content-Type: application/json
Body: { "bot_token": "MTxx...", "guild_id": "1234567890123456789" }
Response 201: { "id": "uuid", "status": "pending", "guild_id": "..." }
Response 400: { "error": "...", "field": "bot_token" | "guild_id" }
Response 403: { "error": "Plan limit reached. Upgrade to add more connections." }
Response 409: { "error": "This bot token is already in use." }
```

### Update Token Modal

When user clicks "Update Token" on an existing connection, a modal appears overlaying the page.

**Modal purpose:** The bot token for an existing Discord connection may need to be updated if:
- The user regenerated their token in the Discord Developer Portal
- The previous token was revoked or invalidated

Updating the token does NOT change the guild ID — it only replaces the stored token.

```html
<dialog class="modal" id="update-token-modal" aria-labelledby="update-token-title" role="dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="update-token-title">Update Bot Token</h3>
      <button class="modal-close" aria-label="Close">×</button>
    </div>
    <div class="modal-body">
      <p class="modal-description">
        Enter a new bot token for <strong>{guild_id}</strong>.
        The bot will reconnect automatically after saving.
      </p>
      <div class="form-group">
        <label for="new-bot-token">New Bot Token</label>
        <input
          id="new-bot-token"
          name="new_bot_token"
          type="password"
          placeholder="Paste your new Discord bot token"
          autocomplete="off"
          required
        />
        <p class="field-hint">
          Regenerate the token in the
          <a href="https://discord.com/developers/applications" target="_blank" rel="noopener">
            Discord Developer Portal
          </a> if the current one was revoked.
        </p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" id="update-token-cancel">Cancel</button>
      <button class="btn-primary" id="update-token-save">Update Token</button>
    </div>
  </div>
</dialog>
```

**Modal specs:**
| Property | Value |
|----------|-------|
| Overlay | `rgba(0, 0, 0, 0.5)` full-screen, `z-index: 50` |
| Modal width | `480px` (desktop), `calc(100vw - 32px)` (mobile) |
| Modal background | White (`#FFFFFF`) |
| Modal border | `1px solid #E5E7EB` |
| Modal border-radius | `0px` |
| Modal padding | `0` (header/body/footer have own padding) |
| Header padding | `24px 24px 16px 24px` |
| Header border-bottom | `1px solid #E5E7EB` |
| `h3` font | Archivo SemiBold, 18px, #0C1F40 |
| Close button | Top-right corner, 24px × 24px, `×` character, 20px, #6B7280 |
| Close button:hover color | #111827 |
| Body padding | `24px` |
| Description font | Inter Regular, 14px, #374151 |
| Description margin-bottom | `20px` |
| Footer padding | `16px 24px 24px 24px` |
| Footer layout | `flex, justify-content: flex-end, gap: 12px` |
| Focus trap | Modal traps focus — Tab cycles through interactive elements within modal |
| Escape key | Closes modal without saving |
| Overlay click | Closes modal without saving |

**Validation rules (Update Token):**

| Rule | Error Message |
|------|--------------|
| Empty | "New bot token is required." |
| Same as current | "This is the same as your current token. Enter a different token to update." |
| Invalid format | "That doesn't look like a valid Discord bot token." |
| Discord rejects token | "Discord rejected this token. Double-check it in the Developer Portal." |
| Network/server error | "Failed to update token. Please try again." (toast) |

**"Update Token" button in modal:**
- Label default: "Update Token"
- Label loading: spinner
- Background: Aqua (#B4E7DD), text Navy
- On success: modal closes, connection row updates with status "Connecting…", toast: "Bot token updated. Reconnecting…"
- On error: error message shown inline below input (modal stays open)

**API call:**
```
PATCH /api/discord-connections/{connection_id}
Content-Type: application/json
Body: { "bot_token": "MTxx..." }
Response 200: { "id": "uuid", "status": "connecting" }
Response 400: { "error": "...", "field": "bot_token" }
Response 403: { "error": "Insufficient permissions." }
Response 404: { "error": "Connection not found." }
```

### Remove Connection Confirmation Dialog

When user clicks "Remove" on an existing connection, a confirmation dialog appears.

```html
<dialog class="modal" id="remove-connection-modal" aria-labelledby="remove-connection-title" role="alertdialog">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="remove-connection-title">Remove Discord Connection</h3>
    </div>
    <div class="modal-body">
      <p>
        This will disconnect your bot from <strong>Guild {guild_id}</strong>.
        The bot will immediately go offline in your Discord server.
        This action cannot be undone, but you can reconnect at any time.
      </p>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" id="remove-cancel">Cancel</button>
      <button class="btn-danger" id="remove-confirm">Remove Connection</button>
    </div>
  </div>
</dialog>
```

**"Remove Connection" button in dialog:**
| Property | Value |
|----------|-------|
| Background | `#DC2626` (Red 600) |
| Text | White |
| Font | Inter SemiBold, 14px |
| Height | `40px` |
| Padding | `0 20px` |
| Border-radius | `0px` |
| Hover background | `#B91C1C` (Red 700) |
| Loading state | Spinner (16px White) replaces label text |

**Remove flow:**
1. User clicks "Remove Connection" in dialog
2. Loading spinner shows
3. `DELETE /api/discord-connections/{connection_id}` is called
4. On success (HTTP 200): modal closes, connection row removed from list, toast: "Discord connection removed."
5. If removing the last connection: empty state appears in connection list
6. On error: toast: "Failed to remove connection. Please try again."

**API call:**
```
DELETE /api/discord-connections/{connection_id}
Response 200: { "success": true }
Response 403: { "error": "Insufficient permissions." }
Response 404: { "error": "Connection not found." }
```

---

## Section 3: Team Members

### Purpose

Displays current workspace members and their roles. Team invites are deferred to a future release — the "Invite Member" button is shown but with a "Coming soon" tooltip. This section is visible to all roles but mutations are owner-only.

### Data Fetching

```typescript
// Query: Members of this tenant
const { data: members } = await supabase
  .from('tenant_members')
  .select(`
    tenant_id,
    user_id,
    role,
    created_at,
    user:auth.users(email, raw_user_meta_data)
  `)
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: true });
```

Note: `auth.users` is not directly queryable via the Supabase client with RLS. Instead, store display names in a `profiles` table or use the `user_metadata` from the JWT. At launch with single-seat (owner only), the member list will always show one row: the owner's email.

**Practical approach at launch:** The API route `/api/settings/members` returns the member list with user email pulled via the Supabase Admin API (service role). The Server Component calls this route.

### Layout

```
<TeamMembersSection>
  <header>
    Team Members
    <button class="invite-btn" [tooltip: "Coming soon — team invites will be available in a future release"]>
      Invite Member
    </button>
  </header>
  <body>
    <MemberList />
  </body>
</TeamMembersSection>
```

**Header layout for this section:** Header uses `flex, justify-content: space-between, align-items: flex-start` to place the section title on the left and the Invite button on the right.

**"Invite Member" button (deferred):**
| Property | Value |
|----------|-------|
| Label | "Invite Member" |
| Style | Outlined — Navy border, Navy text, transparent background |
| Font | Inter SemiBold, 14px |
| Height | `36px` |
| Padding | `0 16px` |
| Border-radius | `0px` |
| State | Disabled (opacity 0.4, cursor not-allowed) |
| Tooltip | "Team invites are coming soon." (shown on hover) |

### Member Row

Each member is rendered as a row:

```html
<div class="member-row">
  <div class="member-avatar">
    <!-- First letter of email in Navy circle -->
    <span>{email[0].toUpperCase()}</span>
  </div>
  <div class="member-info">
    <span class="member-email">{email}</span>
    <span class="member-joined">Joined {relative_date}</span>
  </div>
  <div class="member-role">
    <RoleBadge role="{role}" />
  </div>
</div>
```

| Property | Value |
|----------|-------|
| Row layout | `flex, align-items: center, gap: 16px, padding: 12px 0` |
| Row border-bottom | `1px solid #E5E7EB` (except last row) |
| Avatar size | `36px × 36px` |
| Avatar background | Navy (`#0C1F40`) |
| Avatar text | White, Inter SemiBold, 14px, centered |
| Avatar border-radius | `50%` (circular — exception to 0px rule for avatars only) |
| Member info flex | `flex: 1` |
| Email font | Inter Medium, 14px, #111827 |
| Joined font | Inter Regular, 12px, #6B7280, margin-top: 2px |
| Role badge margin-left | `auto` |

**Role badges:**

| Role | Label | Background | Text Color |
|------|-------|-----------|------------|
| `owner` | "Owner" | Navy (`#0C1F40`) | White |
| `admin` | "Admin" | Aqua (`#B4E7DD`) | Navy (`#0C1F40`) |
| `member` | "Member" | `#F3F4F6` (Gray 100) | `#374151` (Gray 700) |

Badge specs: `height: 22px`, `padding: 2px 8px`, Inter Medium 12px, border-radius `0px`.

**Joined date format:** "Joined March 2026" (month + year only, not day).

---

## Section 4: Account

### Purpose

Allows the current user (any role) to update their display name and change their password. Email is read-only (cannot be changed via the UI — Supabase handles email change via email verification flow, which is not exposed at launch).

### Data Fetching

```typescript
// Fetched from the current user's Supabase Auth session (available server-side)
const { data: { user } } = await supabase.auth.getUser();
// user.email — read-only display
// user.user_metadata.full_name — editable display name
```

### Layout

```
<AccountSection>
  <header>Account</header>
  <body>
    <DisplayNameForm />
    <Divider />
    <ChangePasswordForm />
  </body>
</AccountSection>
```

### Display Name Form

```html
<form id="display-name-form" action="/api/settings/account/display-name" method="POST">
  <div class="form-group">
    <label for="display-name">Display Name</label>
    <div class="input-row">
      <input
        id="display-name"
        name="full_name"
        type="text"
        value="{user.user_metadata.full_name || ''}"
        maxlength="100"
        placeholder="Your name"
      />
      <button type="submit" id="display-name-save">Save</button>
    </div>
    <p class="field-hint">Used in dashboard greetings and team member lists.</p>
  </div>
  <div class="form-group" style="margin-top: 20px;">
    <label>Email</label>
    <p class="readonly-value">{user.email}</p>
    <p class="field-hint">Email cannot be changed. Contact support to update your email address.</p>
  </div>
</form>
```

| Property | Value |
|----------|-------|
| Display Name input width | `320px` (desktop), `100%` (mobile) |
| All input styles | Same as Workspace Name form |
| Save button styles | Same as Workspace Name Save button |
| Email label | "Email" |
| Email value | `readonly-value` class: Inter Regular 14px, #374151, padding: 10px 0 |
| Field hint | 12px Inter Regular, #6B7280, margin-top: 6px |

**Validation rules (Display Name):**

| Rule | Error Message |
|------|--------------|
| Too long (> 100 chars) | "Display name must be 100 characters or less." |
| Server error | Toast: "Failed to update display name. Please try again." |
| Success | Toast: "Display name updated." |

**API call:**
```
POST /api/settings/account/display-name
Body: { "full_name": "Alice Smith" }
Response 200: { "success": true }
Response 400: { "error": "Display name must be 100 characters or less." }
```

**Implementation note:** Updates `auth.users.user_metadata.full_name` via `supabase.auth.updateUser({ data: { full_name: "Alice Smith" } })` called server-side in the API route.

### Section Divider

Between the display name form and the password form:

```html
<hr class="section-divider" />
```

| Property | Value |
|----------|-------|
| Border | None |
| Border-top | `1px solid #E5E7EB` |
| Margin | `24px 0` |

### Change Password Form

```html
<form id="change-password-form" action="/api/settings/account/password" method="POST">
  <h3 style="font: Archivo SemiBold 16px #0C1F40; margin-bottom: 16px;">Change Password</h3>
  <div class="form-group" style="margin-bottom: 16px;">
    <label for="current-password">Current Password</label>
    <input
      id="current-password"
      name="current_password"
      type="password"
      required
      autocomplete="current-password"
    />
  </div>
  <div class="form-group" style="margin-bottom: 16px;">
    <label for="new-password">New Password</label>
    <input
      id="new-password"
      name="new_password"
      type="password"
      required
      autocomplete="new-password"
      minlength="8"
    />
    <p class="field-hint">Minimum 8 characters.</p>
  </div>
  <div class="form-group" style="margin-bottom: 20px;">
    <label for="confirm-password">Confirm New Password</label>
    <input
      id="confirm-password"
      name="confirm_password"
      type="password"
      required
      autocomplete="new-password"
    />
  </div>
  <button type="submit" id="change-password-submit">Update Password</button>
</form>
```

**All input styles:** Same as other form inputs in Settings (height 40px, border #D1D5DB, 0px radius, focus ring Aqua 40%).

**"Update Password" button:**
| Property | Value |
|----------|-------|
| Label | "Update Password" |
| Style | Aqua background, Navy text (same as all primary Save buttons) |
| Loading | Spinner |
| Min-width | `160px` |

**Validation rules (Change Password):**

| Field | Rule | Error Message | Where Shown |
|-------|------|--------------|-------------|
| Current Password | Required | "Current password is required." | Inline below field |
| Current Password | Server: wrong password | "Current password is incorrect." | Inline below field |
| New Password | Required | "New password is required." | Inline below field |
| New Password | Min length < 8 | "Password must be at least 8 characters." | Inline below field |
| New Password | Same as current | "New password must be different from your current password." | Inline below field |
| Confirm Password | Required | "Please confirm your new password." | Inline below field |
| Confirm Password | Mismatch | "Passwords do not match." | Inline below field |
| Network/server error | — | Toast: "Failed to update password. Please try again." | Toast (error, 4s) |
| Success | — | Toast: "Password updated successfully." | Toast (success, 3s) |

**API call:**
```
POST /api/settings/account/password
Body: { "current_password": "...", "new_password": "..." }
Response 200: { "success": true }
Response 400: { "error": "...", "field": "current_password" | "new_password" }
Response 401: { "error": "Current password is incorrect." }
```

**Implementation note:** Supabase does not expose a "verify current password then change" flow in the client SDK. The API route must:
1. Call `supabase.auth.signInWithPassword({ email: user.email, password: current_password })` using the anon key to verify the current password.
2. If successful, call `supabase.auth.admin.updateUserById(userId, { password: new_password })` using the service role key to set the new password.
3. Return 401 if step 1 fails with `invalid_credentials`.

---

## Section 5: Danger Zone

### Visibility

This section is **only rendered for users with `role = 'owner'`**. Admin and member users do not see this section at all — it is not hidden with CSS; it is not rendered server-side. The page component checks the role before including the section in the JSX tree.

### Layout

```html
<div class="settings-card danger-zone">
  <div class="settings-card-header">
    <h2>Danger Zone</h2>
    <p class="section-subtitle">
      These actions are permanent and cannot be undone.
    </p>
  </div>
  <div class="settings-card-body">
    <DeleteWorkspaceRow />
  </div>
</div>
```

**Danger Zone card styles (overrides standard card):**
| Property | Value |
|----------|-------|
| Card border | `1px solid #FCA5A5` (Red 300) |
| Card background | White (`#FFFFFF`) |
| Header border-bottom | `1px solid #FCA5A5` |
| `h2` color | `#991B1B` (Red 800) |

### Delete Workspace Row

```html
<div class="danger-row">
  <div class="danger-row-info">
    <h4>Delete Workspace</h4>
    <p>
      Permanently delete this workspace, all Discord connections, API keys,
      service integrations, and billing data. This cannot be reversed.
    </p>
  </div>
  <button class="btn-danger" id="delete-workspace-btn">Delete Workspace</button>
</div>
```

| Property | Value |
|----------|-------|
| Row layout | `flex, align-items: center, gap: 24px, justify-content: space-between` |
| Row info flex | `flex: 1` |
| `h4` font | Inter SemiBold, 14px, #374151 (Gray 700) |
| `h4` margin-bottom | `4px` |
| `p` font | Inter Regular, 13px, #6B7280 (Gray 500) |
| `p` max-width | `480px` |
| Delete button | Red 600 background, White text (see Delete Workspace Modal below) |

**"Delete Workspace" button:**
| Property | Value |
|----------|-------|
| Label | "Delete Workspace" |
| Background | `#DC2626` (Red 600) |
| Text | White |
| Font | Inter SemiBold, 14px |
| Height | `40px` |
| Padding | `0 20px` |
| Border-radius | `0px` |
| Hover background | `#B91C1C` (Red 700) |
| Flex-shrink | `0` |

### Delete Workspace Confirmation Modal

When user clicks "Delete Workspace", a confirmation modal requires the user to type the workspace name before the delete button activates.

```html
<dialog class="modal" id="delete-workspace-modal" aria-labelledby="delete-workspace-title" role="alertdialog">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="delete-workspace-title">Delete Workspace</h3>
    </div>
    <div class="modal-body">
      <div class="warning-banner">
        <span class="warning-icon">⚠️</span>
        <span>
          This will permanently delete <strong>{tenant.name}</strong> and all associated data.
          This action is irreversible.
        </span>
      </div>
      <p class="delete-consequences">The following will be permanently deleted:</p>
      <ul class="delete-consequences-list">
        <li>All Discord connections ({connections.length} connection{connections.length !== 1 ? 's' : ''})</li>
        <li>All API keys (Anthropic, OpenAI)</li>
        <li>All service integrations (GitHub, Google, Linear, Toggl)</li>
        <li>All billing data and subscription history</li>
        <li>All team members ({members.length} member{members.length !== 1 ? 's' : ''})</li>
      </ul>
      <div class="confirm-input-group">
        <label for="delete-confirm-input">
          Type <strong>{tenant.name}</strong> to confirm:
        </label>
        <input
          id="delete-confirm-input"
          type="text"
          placeholder="{tenant.name}"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" id="delete-workspace-cancel">Cancel</button>
      <button class="btn-danger" id="delete-workspace-confirm" disabled>
        Delete This Workspace
      </button>
    </div>
  </div>
</dialog>
```

**Warning banner:**
| Property | Value |
|----------|-------|
| Background | `#FEF2F2` (Red 50) |
| Border | `1px solid #FECACA` (Red 200) |
| Padding | `12px 16px` |
| Font | Inter Regular, 14px, #991B1B (Red 800) |
| Border-radius | `0px` |
| Margin-bottom | `16px` |
| Layout | `flex, gap: 8px, align-items: flex-start` |

**Consequences list:**
| Property | Value |
|----------|-------|
| `p` label font | Inter SemiBold, 13px, #374151, margin-bottom: 8px |
| `ul` padding-left | `20px` |
| `li` font | Inter Regular, 13px, #374151, padding: 3px 0 |
| Margin-bottom | `20px` |

**Confirm input:**
| Property | Value |
|----------|-------|
| Label font | Inter Regular, 14px, #374151, margin-bottom: 8px |
| Input height | `40px` |
| Input border | `1px solid #D1D5DB` |
| Input border-radius | `0px` |
| Input:focus border | `1px solid #DC2626` (Red — danger context) |
| Input:focus box-shadow | `0 0 0 3px rgba(220, 38, 38, 0.15)` (Red 15%) |

**"Delete This Workspace" button activation:**
- The button starts `disabled` (opacity 0.4, cursor not-allowed)
- A `onInput` handler on the confirm input checks: `input.value === tenant.name`
- When they match exactly (case-sensitive): button becomes enabled (opacity 1, cursor pointer)
- When they differ: button stays disabled

**"Delete This Workspace" button (enabled state):**
| Property | Value |
|----------|-------|
| Background | `#DC2626` (Red 600) |
| Text | White |
| Font | Inter SemiBold, 14px |
| Height | `40px` |
| Padding | `0 20px` |
| Hover background | `#B91C1C` |
| Loading | Spinner (16px White) while request in flight |

**Delete workspace API call:**
```
DELETE /api/settings/workspace
Response 200: { "success": true }
Response 400: { "error": "Confirmation text did not match workspace name." }
Response 403: { "error": "Only the workspace owner can delete the workspace." }
```

**Server-side delete sequence (in API route, wrapped in a single database transaction):**

The API route executes the following deletions in order to satisfy foreign key constraints:

```sql
-- Step 1: Delete all service connections
DELETE FROM tenant_service_connections WHERE tenant_id = $tenant_id;

-- Step 2: Delete all Discord connections
DELETE FROM discord_connections WHERE tenant_id = $tenant_id;

-- Step 3: Delete all API keys (Vault secrets are deleted via trigger/Vault API)
DELETE FROM tenant_api_keys WHERE tenant_id = $tenant_id;

-- Step 4: Delete subscription record
DELETE FROM tenant_subscriptions WHERE tenant_id = $tenant_id;

-- Step 5: Delete all members
DELETE FROM tenant_members WHERE tenant_id = $tenant_id;

-- Step 6: Delete the tenant
DELETE FROM tenants WHERE id = $tenant_id;

-- Note: tenant_members uses ON DELETE CASCADE from tenants, so step 5 is technically
-- redundant. But we list it explicitly for clarity.
```

After the database transaction, the API route:
1. Cancels the Stripe subscription (if active) via Stripe API — `stripe.subscriptions.cancel(stripe_subscription_id, { prorate: false })`
2. Deletes the Stripe Customer — `stripe.customers.del(stripe_customer_id)`
3. Signs the user out by calling `supabase.auth.admin.signOut(session_id)`
4. The auth user (`auth.users` row) is **NOT** deleted — the user's Supabase account persists so they can sign up again

**Post-delete redirect:** After successful delete, the client redirects to `/` (landing page) with a query param `?deleted=1`. The landing page checks for this and displays a toast: "Your workspace has been deleted."

**API call failure handling:**
- If the API call fails (network error, server error): toast "Failed to delete workspace. Please try again." Modal stays open.
- If Stripe cancellation fails: log the error server-side, proceed with workspace deletion anyway (avoid leaving the user stuck). Note in admin panel that Stripe cleanup may be pending.

---

## Data Fetching — Full Server Component Shape

```typescript
// app/(dashboard)/settings/page.tsx
interface SettingsPageData {
  tenant: {
    id: string;
    name: string;
    plan: 'free' | 'starter' | 'pro';
    created_at: string;
  };
  userRole: 'owner' | 'admin' | 'member';
  discordConnections: Array<{
    id: string;
    guild_id: string;
    bot_username: string | null;
    bot_user_id: string | null;
    status: 'pending' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'suspended';
    last_heartbeat: string | null;
    error_message: string | null;
    created_at: string;
  }>;
  members: Array<{
    user_id: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    created_at: string;
  }>;
  currentUser: {
    id: string;
    email: string;
    full_name: string | null;
  };
}
```

All queries run server-side with the Supabase server client (uses the user's JWT). Member email data is fetched via the service role client (Supabase admin SDK). If any query fails, the page renders with an error state (see below).

### Page-Level Error State

If the primary tenant query fails (e.g., tenant not found, RLS blocks access):

```html
<div class="page-error">
  <p>Unable to load settings. Please refresh the page.</p>
  <button onclick="window.location.reload()">Refresh</button>
</div>
```

| Property | Value |
|----------|-------|
| Container | Centered in page content area, margin-top: 80px |
| Text font | Inter Regular, 16px, #374151 |
| Text margin-bottom | 16px |
| Refresh button | Navy background, White text, same style as primary button |

---

## Responsive Behavior

### Desktop (≥ 1280px)

- Full two-column shell (sidebar + main)
- Settings cards at `max-width: 800px` within main content area
- Form input rows (input + save button) are horizontal
- Danger Zone row: info text and delete button are horizontal (space-between)

### Tablet (768px – 1279px)

- Sidebar collapses to icon-only (40px wide) OR becomes a top hamburger menu — see [dashboard.md](./dashboard.md) for full sidebar responsive spec
- Settings cards: full width, no max-width restriction
- Form input rows: horizontal (still fits)
- Danger Zone row: horizontal

### Mobile (< 768px)

- Sidebar hidden; hamburger menu in topbar
- Settings cards: full width, reduced padding `16px 20px 20px 20px`
- Form input rows: stacked vertically (input full-width, Save button below)
- Input width: `100%`
- Connection row actions: stacked below connection info
- Danger Zone row: stacked (info text above, delete button below at full width)
- Modal width: `calc(100vw - 32px)`
- Modal positioned near center of viewport

---

## Loading States

### Page-Level Loading Skeleton

While the server component is streaming (Next.js Suspense):

```html
<div class="settings-skeleton">
  <!-- Workspace card skeleton -->
  <div class="skeleton-card">
    <div class="skeleton-line" style="width: 120px; height: 20px;" />
    <div class="skeleton-line" style="width: 280px; height: 40px; margin-top: 20px;" />
    <div class="skeleton-line" style="width: 160px; height: 12px; margin-top: 8px;" />
  </div>
  <!-- Discord card skeleton -->
  <div class="skeleton-card">
    <div class="skeleton-line" style="width: 160px; height: 20px;" />
    <div class="skeleton-line" style="width: 100%; height: 56px; margin-top: 20px;" />
  </div>
</div>
```

Skeleton animation: `background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;`

### Form Submission Loading States

All forms use the same loading pattern:
1. Submit button shows spinner (16px, matching button text color) and hides text
2. All form inputs become `disabled` during submission
3. No full-page reload — uses `fetch` + `router.refresh()`

---

## Toast Notifications

All toasts are rendered by a global `<Toaster>` component at the root layout level. Settings page triggers toasts via a `useToast()` hook in Client Components.

| Action | Toast Type | Message | Duration |
|--------|-----------|---------|----------|
| Workspace name saved | Success | "Workspace name updated." | 3s |
| Workspace name failed | Error | "Failed to save workspace name. Please try again." | 4s |
| Bot connected | Success | "Bot connection added. Your bot will connect shortly." | 4s |
| Bot connection failed (general) | Error | "Failed to add connection. Please try again." | 4s |
| Bot token updated | Success | "Bot token updated. Reconnecting…" | 4s |
| Bot token update failed | Error | "Failed to update token. Please try again." | 4s |
| Connection removed | Success | "Discord connection removed." | 3s |
| Connection remove failed | Error | "Failed to remove connection. Please try again." | 4s |
| Display name saved | Success | "Display name updated." | 3s |
| Display name failed | Error | "Failed to update display name. Please try again." | 4s |
| Password updated | Success | "Password updated successfully." | 3s |
| Password update failed (network) | Error | "Failed to update password. Please try again." | 4s |
| Workspace deleted | — | Shown on landing page after redirect: "Your workspace has been deleted." | 5s |
| Delete workspace failed | Error | "Failed to delete workspace. Please try again." | 4s |

---

## Accessibility

### Keyboard Navigation

| Element | Behavior |
|---------|---------|
| Tab order | Flows top-to-bottom through sections, left-to-right within rows |
| Forms | Tab through label → input → button; Enter submits form |
| Modals | Focus trapped within modal when open; Escape closes |
| "Update Token" button | Opens modal; focus moves to modal's first input |
| "Remove" button | Opens confirmation dialog; focus moves to Cancel button |
| "Delete Workspace" button | Opens modal; focus moves to confirm input |
| Modal close (×) button | Closes modal; focus returns to the trigger button |

### ARIA Labels

| Element | ARIA |
|---------|------|
| Copy workspace ID button | `aria-label="Copy workspace ID"` |
| Modal overlay | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{h3 id}"` |
| Delete workspace dialog | `role="alertdialog"` (more urgent semantic) |
| Status badges | `role="status"`, `aria-label="Connection status: {label}"` |
| Loading spinners in buttons | `aria-label="Loading"`, `role="status"` on spinner element |
| Disabled buttons with tooltip | `aria-disabled="true"`, `title="{tooltip text}"` |
| Workspace name input | `aria-describedby="workspace-name-hint"` |
| Bot Token input | `aria-describedby="bot-token-hint"` |
| Guild ID input | `aria-describedby="guild-id-hint"` |
| Delete confirm input | `aria-label="Type workspace name to confirm deletion"` |
| Inline error messages | `role="alert"` so screen readers announce them immediately |

### Focus Management

- When a modal opens: `dialog.showModal()` (native `<dialog>`) handles focus trap and returns focus on close
- After form submission (success): focus returns to the form's submit button (which resets to default state)
- After deleting a connection row: focus moves to the "Add Another Connection" toggle button (or the empty state paragraph if it appears)

### Color Contrast

| Pair | Ratio | Meets WCAG AA |
|------|-------|--------------|
| Navy text on White | 15.3:1 | ✓ AAA |
| Gray 500 (#6B7280) on White | 4.6:1 | ✓ AA |
| White text on Navy | 15.3:1 | ✓ AAA |
| Navy text on Aqua (#B4E7DD) | 6.1:1 | ✓ AA |
| Red 800 (#991B1B) on Red 50 | 5.9:1 | ✓ AA |
| White text on Red 600 (#DC2626) | 5.1:1 | ✓ AA |

---

## Cross-References

- [dashboard.md](./dashboard.md) — Dashboard shell (sidebar, topbar) used by this page
- [auth-pages.md](./auth-pages.md) — Auth guard redirect logic
- [../database/schema.md](../database/schema.md) — `tenants`, `tenant_members`, `discord_connections` tables
- [../database/rls-policies.md](../database/rls-policies.md) — RLS policies controlling data access
- [../database/vault-encryption.md](../database/vault-encryption.md) — Bot token encryption via Supabase Vault
- [../api/routes.md](../api/routes.md) — `POST /api/settings/workspace`, `POST /api/settings/account/*`, `POST /api/discord-connections`, `PATCH /api/discord-connections/:id`, `DELETE /api/discord-connections/:id`, `DELETE /api/settings/workspace`
- [../multi-tenant/connection-manager.md](../multi-tenant/connection-manager.md) — How bot picks up new connection from database
- [../multi-tenant/realtime-contract.md](../multi-tenant/realtime-contract.md) — Bot detects `discord_connections.status` changes via Realtime
- [../integrations/discord.md](../integrations/discord.md) — Discord token validation logic used in Add Connection
- [../premium/tiers.md](../premium/tiers.md) — Connection count limits per plan
- [component-library.md](./component-library.md) — StatusBadge, RoleBadge, Toaster, Modal, SkeletonCard components
- [copy.md](./copy.md) — All user-facing strings from this page
- [validation-rules.md](./validation-rules.md) — All form field validation rules cross-referenced
