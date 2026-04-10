## Loading Sessions
Read .superpowers/autopilot-sessions.json, check session count. If one: use it. If multiple: show list, ask which one.

## Fetching Status

### Step 1: Get Session Status
```bash
SESSION_RESPONSE=$(curl -s -X GET "https://api.anthropic.com/v1/sessions/$SESSION_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01")
STATUS=$(echo "$SESSION_RESPONSE" | jq -r '.status')
```

### Step 2: Fetch Events
```bash
EVENTS=$(curl -s -X GET "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01")
```

### Step 3: Parse Events for Display

Current phase: first try from ask_user tool calls, then fall back to scanning agent messages for phase headers (the system prompt instructs the agent to emit "## Phase N:" headers).

```bash
# Primary: from ask_user tool calls
LATEST_PHASE=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "agent.custom_tool_use" and .tool_name == "ask_user") | .input.phase] | last // empty')

# Fallback: scan agent messages for phase transition headers
if [ -z "$LATEST_PHASE" ]; then
  LATEST_PHASE=$(echo "$EVENTS" | jq -r '
    [.data[]
     | select(.type == "agent.message")
     | .content[]?
     | select(.type == "text")
     | .text
     | capture("## Phase [0-9]+: (?<phase>[A-Za-z]+)"; "g")
     | .phase
     | ascii_downcase
    ] | last // "starting"')
fi
```

Pending question: agent.custom_tool_use events with tool_name=="ask_user" that have no matching user.custom_tool_result (compare by event ID).
```bash
# Collect IDs of all answered tool_use events
ANSWERED_IDS=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "user.custom_tool_result") | .custom_tool_use_id] | unique | @json')

# Find unanswered ask_user events
PENDING=$(echo "$EVENTS" | jq --argjson answered "$ANSWERED_IDS" '
  [.data[] | select(.type == "agent.custom_tool_use" and .tool_name == "ask_user")
   | select(.id as $id | $answered | index($id) == null)]
  | last
')

PENDING_ID=$(echo "$PENDING" | jq -r '.id // empty')
PENDING_QUESTION=$(echo "$PENDING" | jq -r '.input.question // empty')
PENDING_OPTIONS=$(echo "$PENDING" | jq -r '.input.options // [] | to_entries | map("\(.key | . + 65 | implode)) \(.value)") | join("\n")')
```

Decisions: scan agent.message events for lines starting with "**Decision:**"
```bash
DECISIONS=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "agent.message") | .content // "" | split("\n")[] | select(startswith("**Decision:**"))] | join("\n")')
```

Artifacts: scan agent.message events for lines starting with "**Committed:**"
```bash
ARTIFACTS=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "agent.message") | .content // "" | split("\n")[] | select(startswith("**Committed:**"))] | join("\n")')
```

## Display Format
```
## Autopilot: <brief-slug>

**Phase:** <phase>
**Status:** <running | Waiting for your input | idle | terminated>
**Branch:** <branch>
**Running since:** <relative time>

### Pending Question
<question text>
Options: A) ... B) ... C) ...

### Decisions Made
1. <decision>

### Artifacts
- <path> (committed)
```

## Answering a Pending Question
1. Display question and options
2. Ask user for answer (use AskUserQuestion tool with options if multiple choice)
3. Send answer via POST to sessions events endpoint with user.custom_tool_result event:
```bash
curl -s -X POST "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"user.custom_tool_result\",
    \"custom_tool_use_id\": \"$PENDING_ID\",
    \"content\": \"$USER_ANSWER\"
  }"
```
4. Tell user "Answer sent! Agent is resuming."

## Updating Local State
Update sessions file with current status and last_checked_at timestamp:
```bash
jq --arg id "$SESSION_ID" --arg status "$STATUS" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
  .sessions = [.sessions[] | if .id == $id then . + {status: $status, last_checked_at: $ts} else . end]
' .superpowers/autopilot-sessions.json > /tmp/sessions-tmp.json && mv /tmp/sessions-tmp.json .superpowers/autopilot-sessions.json
```

## Terminated Sessions
Check for branch via git ls-remote:
```bash
git ls-remote origin refs/heads/$BRANCH 2>/dev/null
```
If branch exists: note committed work. If not: note no work saved.

## API Headers (all calls)
```
-H "x-api-key: $ANTHROPIC_API_KEY"
-H "anthropic-version: 2023-06-01"
-H "anthropic-beta: managed-agents-2026-04-01"
```
