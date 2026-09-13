#!/usr/bin/env bash
# Fitness reminders, 3x/day via Telegram. Cron (system is UTC, Carlos is GMT+8):
#   0 1 * * *   breakfast (09:00 PHT)
#   0 5 * * *   lunch     (13:00 PHT)
#   30 11 * * * dinner    (19:30 PHT)
# Haiku reads Rules v2 + today's log (passed inline, no tools) and writes a ≤6-line nudge.
# The message is sent from bash, so a model hiccup can never drop the reminder entirely.
set -uo pipefail

SLOT="${1:-checkin}"
REPO=/home/clsandoval/cs/monorepo
CLAUDE=/home/clsandoval/.nvm/versions/node/v20.19.5/bin/claude
TG="python3 /home/clsandoval/.claude/skills/telegram/scripts/tg.py send_message"
TODAY=$(TZ=Asia/Manila date +%F)
NOW=$(TZ=Asia/Manila date '+%a %H:%M')

cd "$REPO" || exit 1

RULES=$(awk '/^## The Rules/,/^## Staple macros/' projects/fitness/profile.md)
# today's entry if it exists, else the newest entry, capped
TODAY_ENTRY=$(awk -v d="## $TODAY" 'index($0,d)==1{p=1;print;next} p&&/^## /{exit} p' projects/fitness/log.md | head -40)
LATEST=$(awk '/^## /{n++} n==1' projects/fitness/log.md | head -40)
LATEST_DATE=$(grep -m1 '^## ' projects/fitness/log.md | sed 's/^## //; s/ .*//')
WEEK=$(grep -A1 '^## 2026' projects/fitness/log.md | grep -E '^\- \*\*Weight' | head -7 | tr '\n' ' ')

if [ -n "$TODAY_ENTRY" ]; then
  STATE="TODAY'S LOG ($TODAY):
$TODAY_ENTRY"
else
  STATE="NOTHING LOGGED YET TODAY ($TODAY). Most recent entry ($LATEST_DATE):
$LATEST"
fi

PROMPT="You are Carlos's fitness coach bot. Write ONE short Telegram message (max 6 lines, plain text, no markdown, no headers, 1-2 emoji max) for the ${SLOT} check-in. It is ${NOW} Manila time.

Rules (the coach's, fixed):
$RULES

$STATE

Recent weights: $WEEK

What the message must do:
- Lead with where today stands: cals and protein so far vs 2200 / 150, and what is left. If nothing is logged today, say so and ask him to send what he has eaten so far (and his fasted weight at breakfast).
- Say what the next move is for this slot (breakfast: fasted weight + log; lunch: which plan meal, room left; dinner: the last plan meal, whether a lift is due tonight, and 'stop after this').
- Directive first, then at most one line of why. No arithmetic essays. No pep talk. Do not invent food he did not log.
Output only the message text."

MSG=$(printf '%s' "$PROMPT" | "$CLAUDE" -p --model haiku --no-session-persistence --tools "" --dangerously-skip-permissions 2>/tmp/fitness-reminder.err)
if [ -z "$MSG" ] || printf "%s" "$MSG" | grep -q "Not logged in"; then
  MSG="🍽️ ${SLOT} check-in (${NOW}). Coach bot failed to think — log anyway: send today's food, weight if fasted, and what you trained. Rules: <2200 kcal, >150 g protein."
fi

$TG "$MSG"
