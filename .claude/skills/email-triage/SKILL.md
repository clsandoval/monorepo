---
name: email-triage
description: |
  Triage Outlook/M365 emails — fetch, categorize, summarize, flag important ones, and draft replies.
  Uses Microsoft Graph API with OAuth2 device-code flow.
  Triggers: "triage emails", "check email", "email triage", "check my inbox", "summarize emails",
  "draft reply", "flag email", "categorize emails".
---

# Email Triage — Outlook/M365

Fetch, categorize, summarize, flag, and draft replies for the user's Microsoft 365 inbox.

## Prerequisites

The tooling lives in `automations/email-triage/`. Before first use:

1. Install dependencies (one-time):
   ```bash
   cd automations/email-triage && pip install -r requirements.txt
   ```

2. Authenticate (one-time, or when token expires):
   ```bash
   cd automations/email-triage && python auth.py
   ```
   This prints a URL + code. User opens the URL, enters the code, signs in. Token is cached.

## Available Commands

All commands run from `automations/email-triage/`.

### Fetch emails
```bash
# Unread inbox (default 25)
python fetch.py --summary

# All emails (including read)
python fetch.py --all --summary

# Specific folder
python fetch.py --folder sentitems --summary

# Full email bodies
python fetch.py --full

# More emails
python fetch.py --top 50 --summary
```

### List mail folders
```bash
python fetch.py --folders
```

### Actions (via Python import in bash)
```bash
# Mark as read
python -c "from fetch import mark_read; mark_read('MESSAGE_ID')"

# Flag a message
python -c "from fetch import flag_message; flag_message('MESSAGE_ID')"

# Categorize
python -c "from fetch import categorize_message; categorize_message('MESSAGE_ID', ['Urgent', 'Work'])"

# Draft a reply (creates draft, does NOT send)
python -c "from fetch import create_draft_reply; create_draft_reply('MESSAGE_ID', '<p>Reply body here</p>')"

# Move to folder
python -c "from fetch import move_message; move_message('MESSAGE_ID', 'archive')"
```

## Triage Workflow

When the user asks to triage emails:

1. **Fetch** unread emails with `--summary` first to get the lay of the land
2. **Categorize** each email mentally into:
   - **Urgent/Action Required** — needs a response or action soon
   - **Informational** — FYI, newsletters, notifications
   - **Low Priority** — marketing, automated, can wait
   - **Delegatable** — someone else should handle this
3. **Present** a summary table to the user with your recommendations:
   - Subject, sender, received time
   - Your suggested category and why
   - Suggested action (reply, flag, archive, ignore)
4. **Ask** the user which actions to take before executing any
5. **Execute** — flag, categorize, draft replies, mark read as directed
6. For draft replies, fetch the full body (`--full`) of that specific email first to write a contextual reply

## Important Rules

- **NEVER send emails** without explicit user approval. Only create drafts.
- **NEVER mark emails as read** without user approval.
- **NEVER move or delete emails** without user approval.
- Present your triage analysis first, then ask what actions to take.
- If auth fails, tell the user to run `cd automations/email-triage && python auth.py`.
