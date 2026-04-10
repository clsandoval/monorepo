# Autopilot Status Check

## Loading Sessions
Read `.superpowers/autopilot-sessions.json`, check session count. If one: use it. If multiple: show list, ask which one.

## Fetching Status

### Step 1: Get Session Status
```bash
SESSION_RESPONSE=$(curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01")
STATUS=$(echo "$SESSION_RESPONSE" | jq -r '.status')
```

### Step 2: Fetch Events
```bash
EVENTS=$(curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01")
```

### Step 3: Check for Blocked Actions (CRITICAL)

The most important check: is the session idle because it's DONE or because it NEEDS SOMETHING?

Look at the `session.status_idle` event's `stop_reason`:
- `stop_reason.type == "end_turn"` → Agent finished, no action needed
- `stop_reason.type == "requires_action"` → Agent is BLOCKED waiting for a response

```bash
# Get the latest idle event's stop_reason
STOP_REASON=$(echo "$EVENTS" | jq -r '
  [.data[] | select(.type == "session.status_idle")] | last | .stop_reason.type // "unknown"
')

BLOCKED_EVENT_IDS=$(echo "$EVENTS" | jq -r '
  [.data[] | select(.type == "session.status_idle")] | last | .stop_reason.event_ids // [] | .[]
')
```

If `requires_action`, find what's blocked:
```bash
for EVENT_ID in $BLOCKED_EVENT_IDS; do
  echo "$EVENTS" | jq --arg id "$EVENT_ID" '.data[] | select(.id == $id) | {type, name, input}'
done
```

Blocked events can be:
- `agent.custom_tool_use` → Custom tool (like `ask_user`) needs a response
- `agent.mcp_tool_use` with `evaluated_permission: "ask"` → MCP tool needs user approval
- `agent.tool_use` with `evaluated_permission: "ask"` → Built-in tool needs user approval

### Step 4: Parse Agent Messages

Current phase: scan agent messages for phase headers.
```bash
LATEST_PHASE=$(echo "$EVENTS" | jq -r '
  [.data[]
   | select(.type == "agent.message")
   | .content[]?
   | select(.type == "text")
   | .text
   | capture("## Phase [0-9]+[^:]*: (?<phase>[A-Za-z]+)"; "g")
   | .phase
   | ascii_downcase
  ] | last // "starting"')
```

Decisions:
```bash
DECISIONS=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "agent.message") | .content[]? | select(.type == "text") | .text | split("\n")[] | select(startswith("Decision:") or startswith("**Decision:**"))] | join("\n")')
```

Artifacts:
```bash
ARTIFACTS=$(echo "$EVENTS" | jq -r '[.data[] | select(.type == "agent.message") | .content[]? | select(.type == "text") | .text | split("\n")[] | select(startswith("Artifact:") or startswith("**Committed:**"))] | join("\n")')
```

## Display Format

### If running:
```
## Autopilot: <brief-slug>

**Phase:** <phase>
**Status:** Running
**Running since:** <relative time>

### Recent Activity
<last agent message snippet>
```

### If idle — end_turn (done):
```
## Autopilot: <brief-slug>

**Phase:** <phase>
**Status:** Complete
**Branch:** <branch>

### Decisions Made
<decisions>

### Artifacts
<artifacts>
```

### If idle — requires_action (BLOCKED):
```
## Autopilot: <brief-slug>

**Phase:** <phase>
**Status:** ⚠️ BLOCKED — waiting for your input

### Blocked Action
<description of what's blocked — tool confirmation, custom tool response, etc.>

### Options
<if tool confirmation: Approve or Deny>
<if custom tool: show question and options>
```

## Responding to Blocked Actions

### For custom tool calls (ask_user):
```bash
curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg id "$EVENT_ID" --arg answer "$USER_ANSWER" '{
    events: [{
      type: "user.custom_tool_result",
      custom_tool_use_id: $id,
      content: [{type: "text", text: $answer}]
    }]
  }')"
```

### For tool confirmations (MCP or built-in tools needing approval):
```bash
curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg id "$EVENT_ID" --argjson approved true '{
    events: [{
      type: "user.tool_confirmation",
      event_id: $id,
      approved: $approved
    }]
  }')"
```

After responding, tell user: "Response sent! Agent is resuming."

## Updating Local State
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
