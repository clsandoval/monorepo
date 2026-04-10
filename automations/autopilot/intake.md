# Autopilot Intake & Dispatch

## Intake Questions (ask one at a time):

Q1: "What are you trying to build or figure out?" — free text brief
Q2: "Which repo?" — GitHub URL, "this repo", or local path. Resolve to GitHub URL via `git remote get-url origin`. Validate looks like https://github.com/<owner>/<repo>
Q3: "Which branch to base off?" — default: main
Q4: "Any constraints or context?" — optional, press enter to skip

## Slugifying the Brief
```bash
SLUG=$(echo "$BRIEF" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50)
```

## Dispatching the Session

### Step 1: Create Session
Use curl POST to /v1/sessions with:
- agent: {type: "agent", id: $AGENT_ID, version: $AGENT_VERSION (as number)}
- environment_id
- title: "autopilot: $SLUG"
- resources: github_repository with url, mount_path /workspace/repo, authorization_token, checkout branch
- vault_ids: [$VAULT_ID] if vault exists

```bash
# Read config
AGENT_ID=$(jq -r '.agent_id' .superpowers/autopilot-config.json)
AGENT_VERSION=$(jq -r '.agent_version' .superpowers/autopilot-config.json)
ENVIRONMENT_ID=$(jq -r '.environment_id' .superpowers/autopilot-config.json)
VAULT_ID=$(jq -r '.vault_id // empty' .superpowers/autopilot-config.json)
GITHUB_TOKEN=$(jq -r '.github_token' .superpowers/autopilot-config.json)

# Build vault_ids array conditionally
VAULT_IDS=$([ -n "$VAULT_ID" ] && echo "[\"$VAULT_ID\"]" || echo "[]")

# Build and send request
curl -sS https://api.anthropic.com/v1/sessions \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n \
    --arg agent_id "$AGENT_ID" \
    --argjson agent_version "$AGENT_VERSION" \
    --arg environment_id "$ENVIRONMENT_ID" \
    --arg title "autopilot: $SLUG" \
    --arg repo_url "$REPO_URL" \
    --arg github_token "$GITHUB_TOKEN" \
    --arg base_branch "$BASE_BRANCH" \
    --argjson vault_ids "$VAULT_IDS" \
    '{
      agent: {type: "agent", id: $agent_id, version: $agent_version},
      environment_id: $environment_id,
      title: $title,
      resources: [{
        type: "github_repository",
        url: $repo_url,
        mount_path: "/workspace/repo",
        authorization_token: $github_token,
        checkout: {type: "branch", name: $base_branch}
      }],
      vault_ids: $vault_ids
    }')"
```

Headers:
```
-H "x-api-key: $ANTHROPIC_API_KEY"
-H "anthropic-version: 2023-06-01" 
-H "anthropic-beta: managed-agents-2026-04-01"
-H "content-type: application/json"
```

### Step 2: Send the Brief
Compose message from intake answers: Brief, Repository, Branch for Work, and optional Constraints.

```bash
SESSION_ID="<id from Step 1 response>"
BASE_BRANCH="$BASE_BRANCH"  # from Q3
CONSTRAINTS="$CONSTRAINTS"  # from Q4, may be empty

MESSAGE_TEXT=$(jq -n -r \
  --arg brief "$BRIEF" \
  --arg repo "$REPO_URL" \
  --arg branch "autopilot/$SLUG" \
  --arg base_branch "$BASE_BRANCH" \
  --arg constraints "$CONSTRAINTS" \
  '"Brief: " + $brief + "\nRepository: " + $repo + "\nBranch for Work: " + $branch + "\nBase Branch: " + $base_branch + (if $constraints != "" then "\nConstraints: " + $constraints else "" end)')

curl -sS "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg text "$MESSAGE_TEXT" '{
    events: [{
      type: "user.message",
      content: [{type: "text", text: $text}]
    }]
  }')"
```

### Step 3: Save Session to Local State
Add to .superpowers/autopilot-sessions.json using jq:
- id, brief, repo, branch (autopilot/$SLUG), base_branch, started_at, status: "running", last_checked_at: null

```bash
STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Initialize file if it doesn't exist
[ -f .superpowers/autopilot-sessions.json ] || echo '{"sessions": []}' > .superpowers/autopilot-sessions.json

# Append new session entry
jq \
  --arg id "$SESSION_ID" \
  --arg brief "$BRIEF" \
  --arg repo "$REPO_URL" \
  --arg branch "autopilot/$SLUG" \
  --arg base_branch "$BASE_BRANCH" \
  --arg started_at "$STARTED_AT" \
  '.sessions += [{
    id: $id,
    brief: $brief,
    repo: $repo,
    branch: $branch,
    base_branch: $base_branch,
    started_at: $started_at,
    status: "running",
    last_checked_at: null
  }]' .superpowers/autopilot-sessions.json > /tmp/autopilot-sessions-tmp.json \
  && mv /tmp/autopilot-sessions-tmp.json .superpowers/autopilot-sessions.json
```

### Step 4: Confirm to User
Display session ID, brief, repo, branch, base branch, and remind about /autopilot status.

```
Session dispatched.

  Session ID : <SESSION_ID>
  Brief      : <BRIEF>
  Repo       : <REPO_URL>
  Branch     : autopilot/<SLUG>
  Base branch: <BASE_BRANCH>

The agent is running on Anthropic's infrastructure. Use /autopilot status to check in.
```
