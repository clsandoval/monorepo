#!/bin/bash
# Inject tmux pane scrollback as SessionStart additionalContext.
# Safe no-op outside tmux or when scrollback is empty.

if [ -z "$TMUX" ]; then
  exit 0
fi

PANE="${TMUX_PANE:-$(tmux display-message -p '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null)}"
[ -z "$PANE" ] && exit 0

SCROLLBACK=$(tmux capture-pane -p -S -200 -t "$PANE" 2>/dev/null | sed -e 's/[[:space:]]*$//' | awk 'NF || prev_nf {print; prev_nf=NF}')

# Trim to ~9000 chars to stay under the 10k additionalContext cap
MAX=9000
if [ ${#SCROLLBACK} -gt $MAX ]; then
  SCROLLBACK="...[truncated]...
${SCROLLBACK: -$MAX}"
fi

# Skip if essentially empty (just a prompt or two)
if [ ${#SCROLLBACK} -lt 40 ]; then
  exit 0
fi

jq -n --arg context "=== TMUX PANE SCROLLBACK (prior context before this session started) ===
$SCROLLBACK
=== END SCROLLBACK ===" \
  '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$context}}'
