# Hermit-Kosmas: WhatsApp Bot for Kosmas Athletic Ventures

## Overview

Fork NanoClaw into `apps/hermit-kosmas/` as a dedicated WhatsApp bot for the Kosmas Athletic Ventures internal team. The bot — named **Hermit** — answers questions about the Kosmas knowledge base, triages Outlook email via IMAP/SMTP, and does anything else Claude Agent SDK supports (coding, web search, bash, etc).

Internal use only. Access controlled via WhatsApp sender allowlist.

## Fork Process

Full copy of NanoClaw into the monorepo:

```bash
cp -r automations/nanoclaw apps/hermit-kosmas
cd apps/hermit-kosmas
rm -rf .git                          # Detach from upstream git history
```

Then customize:
1. Update `config.ts` — change config paths from `~/.config/nanoclaw/` to `~/.config/nanoclaw-kosmas/`
2. Update `container/build.sh` — change image tag to `hermit-kosmas-agent:latest`
3. Update `package.json` — change `name` to `hermit-kosmas`
4. Update `.env` — set `ASSISTANT_NAME=Hermit`, `CONTAINER_IMAGE=hermit-kosmas-agent:latest`
5. Update container name prefix in `container-runner.ts` from `nanoclaw-` to `hermit-kosmas-`
6. Replace `groups/main/CLAUDE.md` with Hermit's system prompt
7. Replace `groups/global/CLAUDE.md` with knowledge base pointer
8. Add `knowledge/` directory with curated content
9. Run `/add-whatsapp` skill to set up WhatsApp channel (requires separate phone number or WhatsApp Business account)

The fork is fully independent — its own config directory, container image, WhatsApp session, and process. Can run alongside an existing NanoClaw instance on the same host.

## Repository Structure

```
apps/hermit-kosmas/
├── knowledge/                          # Kosmas knowledge base (single source of truth)
│   ├── brand.md                        # Brand guidelines, colors, typography
│   └── brand/
│       └── logokosmasfinal.jpg         # Logo asset
├── groups/
│   ├── main/
│   │   └── CLAUDE.md                   # Hermit identity + email instructions
│   └── global/
│       └── CLAUDE.md                   # Shared context — points to knowledge/
├── .claude/skills/
│   └── add-outlook/                    # IMAP/SMTP email skill
│       ├── SKILL.md                    # Skill instructions
│       ├── add/
│       │   └── (files added by skill)
│       ├── modify/
│       │   └── container/Dockerfile.intent.md       # Add imapflow + nodemailer
│       │   └── src/container-runner.ts.intent.md    # Add outlook-creds.json volume mount
│       │   └── groups/main/CLAUDE.md.intent.md      # Add email instructions
│       └── resources/
│           └── imapflow-examples.md    # Reference snippets for IMAP operations
├── container/                          # Modified Dockerfile (adds imapflow + nodemailer)
└── ... (rest of nanoclaw unchanged)
```

## Knowledge Base

Curated content the bot needs to answer questions. NOT a raw dump of dev artifacts.

**Initial content:**
- `knowledge/brand.md` — Brand guidelines extracted from `.impeccable.md` (colors, typography, personality, logo usage)
- `knowledge/brand/logokosmasfinal.jpg` — Logo asset

Knowledge base content to be expanded in a separate brainstorm. The `knowledge/` directory is the single source of truth — Kosmas content currently in the monorepo (`projects/kosmas/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`, `docs/brand/kosmas/`) will be moved here. What to keep vs. discard is TBD.

The bot reads these files via built-in file tools. The fork's project root (`apps/hermit-kosmas/`) is mounted into the container at `/workspace/project/` (NanoClaw's default mount behavior), making knowledge available at `/workspace/project/knowledge/`. No vector DB, no embeddings — flat markdown.

## Outlook Email Integration

### Approach

Built as a NanoClaw skill (`/add-outlook`) following the `/add-gmail` pattern. No MCP server or formal tool registration — just system prompt instructions + inline Node.js scripts executed via Bash.

### Container Changes

- Install `imapflow` (IMAP read/search) and `nodemailer` (SMTP send) in the container Dockerfile
- Add credential mount in `container-runner.ts` via `buildVolumeMounts()` (same pattern as Gmail skill's mount for `~/.gmail-mcp`)

### Credentials

Stored on host, never committed to repo:
- Path: `~/.config/nanoclaw-kosmas/outlook-creds.json`
- Mounted into container at `/secrets/outlook-creds.json` via a conditional volume mount in `buildVolumeMounts()`
- Format:
```json
{
  "imap": {
    "host": "outlook.office365.com",
    "port": 993,
    "secure": true
  },
  "smtp": {
    "host": "smtp.office365.com",
    "port": 587,
    "secure": false
  },
  "auth": {
    "user": "you@outlook.com",
    "pass": "your-app-password"
  }
}
```

Auth: Outlook app password (works with MFA accounts, no Azure AD app registration needed). Note: M365 tenant admins can disable app passwords — verify this is enabled for the Kosmas account.

### Operations

The system prompt teaches the agent three email operations via inline Node.js scripts. Example patterns:

**Search emails:**
```javascript
const { ImapFlow } = require('imapflow');
const creds = require('/secrets/outlook-creds.json');
const client = new ImapFlow({ ...creds.imap, auth: creds.auth });
await client.connect();
const lock = await client.getMailboxLock('INBOX');
try {
  const messages = [];
  for await (const msg of client.fetch(
    { or: [{ subject: 'SEARCH_TERM' }, { from: 'sender@example.com' }] },
    { envelope: true }
  )) {
    messages.push({ uid: msg.uid, subject: msg.envelope.subject, from: msg.envelope.from, date: msg.envelope.date });
  }
  console.log(JSON.stringify(messages, null, 2));
} finally { lock.release(); await client.logout(); }
```

**Read full email:**
```javascript
const { ImapFlow } = require('imapflow');
const creds = require('/secrets/outlook-creds.json');
const client = new ImapFlow({ ...creds.imap, auth: creds.auth });
await client.connect();
const lock = await client.getMailboxLock('INBOX');
try {
  const source = await client.download(MESSAGE_UID);
  let rawEmail = '';
  for await (const chunk of source.content) { rawEmail += chunk.toString(); }
  // Extract text between headers and boundaries for plain text body
  console.log(rawEmail);
} finally { lock.release(); await client.logout(); }
```

**Send email:**
```javascript
const nodemailer = require('nodemailer');
const creds = require('/secrets/outlook-creds.json');
const transport = nodemailer.createTransport({ ...creds.smtp, auth: creds.auth });
await transport.sendMail({ from: creds.auth.user, to: 'recipient@example.com', subject: 'Subject', text: 'Body' });
```

**Error handling:** If IMAP connection fails or credentials are invalid, the agent should report the error to the user and suggest checking credentials at `~/.config/nanoclaw-kosmas/outlook-creds.json` on the host.

### Skill Structure

```
.claude/skills/add-outlook/
├── SKILL.md                    # Instructions for applying the skill
├── add/
│   └── (files added by skill)
├── modify/
│   └── container/Dockerfile.intent.md       # Add imapflow + nodemailer to npm install
│   └── src/container-runner.ts.intent.md    # Add outlook-creds.json volume mount
│   └── groups/main/CLAUDE.md.intent.md      # Add email operation instructions + examples
└── resources/
    └── imapflow-examples.md    # Full reference snippets for all three operations
```

## Bot Identity

**Name:** Hermit
**Environment variable:** `ASSISTANT_NAME=Hermit`
**Trigger:** `@Hermit` in non-main groups

### System Prompt (`groups/main/CLAUDE.md`)

Identity:
- Internal assistant for Kosmas Athletic Ventures Co.
- Audience: internal team only

Capabilities:
- Knowledge base queries (reads `/workspace/project/knowledge/` directory)
- Email triage via Outlook (IMAP search/read, SMTP send)
- Anything Claude Agent SDK supports: coding, web search, browser, bash, file operations

Tone:
- Very direct
- Very terse
- No nonsense
- Slightly sarcastic when appropriate

### System Prompt (`groups/global/CLAUDE.md`)

Minimal: points to `/workspace/project/knowledge/` as the reference directory for Kosmas information.

## Access Control

WhatsApp sender allowlist at `~/.config/nanoclaw-kosmas/sender-allowlist.json`. Uses NanoClaw's standard allowlist format:

```json
{
  "default": { "allow": [], "mode": "drop" },
  "chats": {
    "1234567890@s.whatsapp.net": { "allow": "*", "mode": "trigger" },
    "0987654321@s.whatsapp.net": { "allow": "*", "mode": "trigger" }
  },
  "logDenied": true
}
```

Each entry uses NanoClaw's `ChatAllowlistEntry` schema: `allow` is `"*"` or a string array of sender IDs, `mode` is `"trigger"` (require @Hermit prefix) or `"drop"` (silently ignore). The `default` entry with empty allow + drop mode rejects all unknown senders. Phone numbers use WhatsApp JID format (`number@s.whatsapp.net`). Configured during `/setup` skill.

## Deployment

Same as base NanoClaw — local/self-hosted or Fly.io. Runs as a systemd service on Linux or launchd on macOS.

Requires a separate WhatsApp session — either a dedicated phone number or a WhatsApp Business account. Cannot share a WhatsApp session with another NanoClaw instance.

Container image built with `container/build.sh` (update tag to `hermit-kosmas-agent:latest`).

Environment:
```
ASSISTANT_NAME=Hermit
CONTAINER_IMAGE=hermit-kosmas-agent:latest
CONTAINER_TIMEOUT=1800000
MAX_CONCURRENT_CONTAINERS=5
```

## What's NOT In Scope

- Knowledge base content curation (separate brainstorm)
- Azure AD app registration / Microsoft Graph API
- Outlook as a channel (email is a tool, not an input channel)
- Multi-tenant / public-facing access
- Vector DB or embeddings
