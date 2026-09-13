#!/usr/bin/env bash
# 1st-of-month finance check-in. Cron: 0 9 1 * *
# ponytail: message is hardcoded here, not templated. Edit this file to change the checklist.
set -euo pipefail

FINANCE_MONTH=$(date -d "last month" +"%B %Y")

python3 ~/.claude/skills/telegram/scripts/tg.py send_message "💰 Finance check-in — reconciling ${FINANCE_MONTH}

Send me, as screenshots or exports:
1. Wise — transaction history for ${FINANCE_MONTH}
2. GCash — same
3. China Bank — same
4. BDO — same
5. Maya — same
6. Subs you started or killed since last check-in

Send all five accounts even if one looks boring — I need both legs of a transfer to net it out instead of counting it as spending.

Drop them here or in a Codex session. I'll update data/finances/ and give you the month's totals + what to cancel.

Renewals coming up: check data/finances/subscriptions.md"
