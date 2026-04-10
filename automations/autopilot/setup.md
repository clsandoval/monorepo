# Autopilot — One-Time Setup

This document guides you through the one-time setup of the Managed Agent infrastructure that the autopilot skill depends on. Setup creates a persistent environment, a reusable agent, an optional secret vault, and saves all IDs to `.superpowers/autopilot-config.json`.

---

## Loading Existing Config

Before running any setup steps, check if setup has already been completed:

```bash
cat .superpowers/autopilot-config.json 2>/dev/null
```

If the file exists and contains valid IDs, setup is already complete. Load the values into shell variables and skip to the Verification step:

```bash
ENVIRONMENT_ID=$(jq -r '.environment_id' .superpowers/autopilot-config.json)
AGENT_ID=$(jq -r '.agent_id' .superpowers/autopilot-config.json)
AGENT_VERSION=$(jq -r '.agent_version' .superpowers/autopilot-config.json)
VAULT_ID=$(jq -r '.vault_id // empty' .superpowers/autopilot-config.json)
```

---

## Prerequisites Check

Before proceeding, verify the required credentials are available:

```bash
# Check ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ERROR: ANTHROPIC_API_KEY is not set."
  echo "Set it with: export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

# Check for GitHub PAT (optional — only needed for vault/MCP step)
if [ -z "$GITHUB_TOKEN" ]; then
  echo "NOTE: GITHUB_TOKEN is not set. Step 3 (vault creation) will be skipped."
fi

echo "Prerequisites check passed."
```

---

## Step 1: Create Environment

Create a persistent compute environment named `autopilot-env`. The environment enables unrestricted networking so the agent can clone repos, run npm installs, and make API calls.

```bash
ENV_RESPONSE=$(curl -sS https://api.anthropic.com/v1/environments \
  -X POST \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d '{
    "name": "autopilot-env",
    "config": {
      "type": "cloud",
      "networking": {"type": "unrestricted"}
    }
  }')

echo "$ENV_RESPONSE" | jq .
```

Handle the 409 conflict — if the environment already exists, fetch the existing one:

```bash
ENV_STATUS=$(echo "$ENV_RESPONSE" | jq -r '.type // "success"')

if [ "$ENV_STATUS" = "error" ]; then
  ERROR_TYPE=$(echo "$ENV_RESPONSE" | jq -r '.error.type // ""')
  if [ "$ERROR_TYPE" = "conflict_error" ]; then
    echo "Environment already exists — fetching existing environment..."
    ENV_RESPONSE=$(curl -sS "https://api.anthropic.com/v1/environments?name=autopilot-env" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "anthropic-beta: managed-agents-2026-04-01" \
      -H "content-type: application/json")
    echo "$ENV_RESPONSE" | jq .
  else
    echo "ERROR creating environment: $(echo "$ENV_RESPONSE" | jq -r '.error.message')"
    exit 1
  fi
fi

ENVIRONMENT_ID=$(echo "$ENV_RESPONSE" | jq -r '.id // .data[0].id')
echo "Environment ID: $ENVIRONMENT_ID"
```

---

## Step 2: Create Agent

Read the system prompt from `system-prompt.md` (located in the same directory as this file), then create the agent with the full tool configuration including the `ask_user` custom tool.

```bash
SKILL_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "$0")")"
SYSTEM_PROMPT=$(cat "$SKILL_DIR/system-prompt.md")

AGENT_RESPONSE=$(curl -sS https://api.anthropic.com/v1/agents \
  -X POST \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n \
    --arg name "Autopilot" \
    --arg model "claude-opus-4-6" \
    --arg system "$SYSTEM_PROMPT" \
    '{
      name: $name,
      model: $model,
      system: $system,
      mcp_servers: [
        {
          type: "url",
          name: "github",
          url: "https://api.githubcopilot.com/mcp/"
        }
      ],
      tools: [
        {
          type: "agent_toolset_20260401"
        },
        {
          type: "mcp_toolset",
          mcp_server_name: "github"
        },
        {
          type: "custom",
          name: "ask_user",
          description: "Pause execution and ask the user a question. Use this when you genuinely need human input to proceed — ambiguous requirements, destructive actions, critical decisions. Do not overuse; prefer making reasonable assumptions for low-stakes choices.",
          input_schema: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "The question to ask the user. Be specific and concise."
              },
              options: {
                type: "array",
                items: { type: "string" },
                description: "Optional list of suggested answers the user can choose from."
              },
              phase: {
                type: "string",
                enum: ["brainstorming", "spec", "planning", "implementation", "review"],
                description: "The current workflow phase when asking the question."
              },
              context: {
                type: "string",
                description: "Brief context explaining why this question is being asked and what depends on the answer."
              }
            },
            required: ["question", "phase", "context"]
          }
        }
      ]
    }')")

echo "$AGENT_RESPONSE" | jq .
```

Extract agent ID and version:

```bash
AGENT_ID=$(echo "$AGENT_RESPONSE" | jq -r '.id')
AGENT_VERSION=$(echo "$AGENT_RESPONSE" | jq -r '.version')

if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "null" ]; then
  echo "ERROR: Failed to create agent."
  echo "$AGENT_RESPONSE" | jq .
  exit 1
fi

echo "Agent ID: $AGENT_ID"
echo "Agent Version: $AGENT_VERSION"
```

---

## Step 3: Create Vault and GitHub MCP Credential (Optional)

This step is optional. It stores the GitHub OAuth token in a Managed Agents vault so the agent can authenticate to the GitHub MCP server without receiving the token in plaintext. Skip if `GITHUB_TOKEN` is not set.

```bash
VAULT_ID=""

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Creating secret vault..."

  VAULT_RESPONSE=$(curl -sS https://api.anthropic.com/v1/vaults \
    -X POST \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "anthropic-beta: managed-agents-2026-04-01" \
    -H "content-type: application/json" \
    -d '{"name": "autopilot-vault"}')

  echo "$VAULT_RESPONSE" | jq .
  VAULT_ID=$(echo "$VAULT_RESPONSE" | jq -r '.id')

  if [ -n "$VAULT_ID" ] && [ "$VAULT_ID" != "null" ]; then
    echo "Vault ID: $VAULT_ID"
    echo "Storing GitHub token as vault credential..."

    CRED_RESPONSE=$(curl -sS "https://api.anthropic.com/v1/vaults/$VAULT_ID/credentials" \
      -X POST \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "anthropic-beta: managed-agents-2026-04-01" \
      -H "content-type: application/json" \
      -d "$(jq -n \
        --arg token "$GITHUB_TOKEN" \
        '{
          display_name: "GitHub MCP OAuth",
          auth: {
            type: "mcp_oauth",
            mcp_server_url: "https://api.githubcopilot.com/mcp/",
            access_token: $token
          }
        }')")

    echo "$CRED_RESPONSE" | jq .
    echo "GitHub MCP credential stored in vault."
  else
    echo "WARNING: Vault creation failed. Continuing without vault."
    VAULT_ID=""
  fi
else
  echo "GITHUB_TOKEN not set — skipping vault creation."
fi
```

---

## Step 4: Save Config to .superpowers/autopilot-config.json

Persist all setup results so future invocations can skip setup entirely.

```bash
mkdir -p .superpowers

CONFIG=$(jq -n \
  --arg environment_id "$ENVIRONMENT_ID" \
  --arg agent_id "$AGENT_ID" \
  --arg agent_version "$AGENT_VERSION" \
  --arg vault_id "${VAULT_ID:-}" \
  --arg github_token_env_var "GITHUB_TOKEN" \
  --arg setup_completed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{
    environment_id: $environment_id,
    agent_id: $agent_id,
    agent_version: $agent_version,
    vault_id: (if $vault_id == "" then null else $vault_id end),
    github_token_env_var: $github_token_env_var,
    setup_completed_at: $setup_completed_at
  }')

echo "$CONFIG" > .superpowers/autopilot-config.json
echo "Config saved to .superpowers/autopilot-config.json"
echo "$CONFIG" | jq .
```

Ensure the file is gitignored:

```bash
if ! grep -q "autopilot-config.json" .gitignore 2>/dev/null; then
  echo ".superpowers/autopilot-config.json" >> .gitignore
  echo "Added autopilot-config.json to .gitignore"
fi
```

---

## Step 5: Initialize Sessions File

Create the sessions tracking file if it doesn't already exist.

```bash
SESSIONS_FILE=".superpowers/autopilot-sessions.json"

if [ ! -f "$SESSIONS_FILE" ]; then
  echo '{"sessions": []}' > "$SESSIONS_FILE"
  echo "Initialized $SESSIONS_FILE"
else
  echo "Sessions file already exists — skipping initialization."
fi

# Ensure sessions file is also gitignored
if ! grep -q "autopilot-sessions.json" .gitignore 2>/dev/null; then
  echo ".superpowers/autopilot-sessions.json" >> .gitignore
  echo "Added autopilot-sessions.json to .gitignore"
fi
```

---

## Verification

Confirm the agent exists and is reachable:

```bash
VERIFY=$(curl -sS "https://api.anthropic.com/v1/agents/$AGENT_ID" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json")

AGENT_NAME=$(echo "$VERIFY" | jq -r '.name')

if [ "$AGENT_NAME" = "Autopilot" ]; then
  echo "Verification passed. Agent '$AGENT_NAME' is live."
  echo ""
  echo "Setup complete. Summary:"
  echo "  Environment: $ENVIRONMENT_ID"
  echo "  Agent:       $AGENT_ID  (v$AGENT_VERSION)"
  if [ -n "$VAULT_ID" ]; then
    echo "  Vault:       $VAULT_ID"
  else
    echo "  Vault:       (not configured)"
  fi
else
  echo "WARNING: Agent verification returned unexpected name: $AGENT_NAME"
  echo "$VERIFY" | jq .
fi
```

---

## Example Config File

After successful setup, `.superpowers/autopilot-config.json` will look like:

```json
{
  "environment_id": "env_abc123",
  "agent_id": "agent_def456",
  "agent_version": "1772585501101368014",
  "vault_id": "vlt_ghi789",
  "github_token_env_var": "GITHUB_TOKEN",
  "setup_completed_at": "2026-04-10T14:00:00Z"
}
```

If vault was skipped, `vault_id` will be `null`. The `github_token_env_var` field records which environment variable holds the GitHub token — used at session dispatch time if vault is not configured.
