#!/usr/bin/env bash
set -euo pipefail

set -a; source /home/clsandoval/cs/monorepo/.env; set +a

cd /home/clsandoval/cs/monorepo

SKILL_DIR=/home/clsandoval/.claude/skills/autopilot
EP=${EP:-13}
SLUG="ep-${EP}-eliza-pimsleur"
BRIEF_DIR="briefs/2026-04-22-${SLUG}"
mkdir -p "$BRIEF_DIR"

H_KEY="x-api-key: $ANTHROPIC_API_KEY"
H_VER="anthropic-version: 2023-06-01"
H_MA="anthropic-beta: managed-agents-2026-04-01"
H_SK="anthropic-beta: skills-2025-10-02"
H_FL="anthropic-beta: files-api-2025-04-14"
H_CT="content-type: application/json"

echo ">> Uploading podcast skill (SKILL.md + pimsleur ref + scripts)"
POD_RESP=$(curl -sS -X POST "https://api.anthropic.com/v1/skills" \
  -H "$H_KEY" -H "$H_VER" -H "$H_SK" \
  -F "display_title=Podcast Pimsleur ep${EP} $(date +%s)" \
  -F "files[]=@$SKILL_DIR/skills/podcast/SKILL.md;filename=podcast/SKILL.md" \
  -F "files[]=@$SKILL_DIR/remote-skills/podcast-pimsleur.md;filename=podcast/podcast-pimsleur.md" \
  -F "files[]=@$SKILL_DIR/scripts/generate.sh;filename=podcast/scripts/generate.sh" \
  -F "files[]=@$SKILL_DIR/scripts/verify-dialogue.py;filename=podcast/scripts/verify-dialogue.py")
POD_SKILL_ID=$(echo "$POD_RESP" | jq -r '.id // empty')
echo "podcast skill_id=$POD_SKILL_ID"
[ -z "$POD_SKILL_ID" ] && { echo "FAIL podcast skill upload: $POD_RESP"; exit 1; }

echo ">> Uploading brainstorming skill"
BS_RESP=$(curl -sS -X POST "https://api.anthropic.com/v1/skills" \
  -H "$H_KEY" -H "$H_VER" -H "$H_SK" \
  -F "display_title=Brainstorming ep${EP} $(date +%s)" \
  -F "files[]=@$SKILL_DIR/skills/brainstorming/SKILL.md;filename=brainstorming/SKILL.md")
BS_SKILL_ID=$(echo "$BS_RESP" | jq -r '.id // empty')
echo "brainstorming skill_id=$BS_SKILL_ID"
[ -z "$BS_SKILL_ID" ] && { echo "FAIL brainstorming skill upload: $BS_RESP"; exit 1; }

upload_file () {
  local path="$1" fname="$2"
  curl -sS -X POST "https://api.anthropic.com/v1/files" \
    -H "$H_KEY" -H "$H_VER" -H "$H_FL" \
    -F "file=@${path};filename=${fname}" \
    -F "purpose=agent" | jq -r '.id // empty'
}

echo ">> Uploading .env"
ENV_ID=$(upload_file .env .env)
echo "env_id=$ENV_ID"

echo ">> Uploading dialogue + curriculum files"
DIALOGUE_ID=$(upload_file "briefs/2026-04-22-flight-podcast/ep_${EP}.md" "ep_${EP}.md")
SCHEDULE_ID=$(upload_file data/japanese/schedule.yaml schedule.yaml)
PROFILE_ID=$(upload_file data/japanese/profile.yaml profile.yaml)
VOCAB_ID=$(upload_file data/japanese/vocabulary.yaml vocabulary.yaml)
GRAMMAR_ID=$(upload_file data/japanese/grammar.yaml grammar.yaml)
echo "dialogue=$DIALOGUE_ID schedule=$SCHEDULE_ID profile=$PROFILE_ID vocab=$VOCAB_ID grammar=$GRAMMAR_ID"

SYSTEM_PROMPT=$(cat "$SKILL_DIR/system-prompt.md")

echo ">> Creating agent"
AGENT_RESP=$(curl -sS -X POST https://api.anthropic.com/v1/agents \
  -H "$H_KEY" -H "$H_VER" -H "$H_MA" -H "$H_CT" \
  -d "$(jq -n \
    --arg name "Autopilot: $SLUG" \
    --arg system "$SYSTEM_PROMPT" \
    --arg pid "$POD_SKILL_ID" \
    --arg bid "$BS_SKILL_ID" \
    '{
      name: $name,
      model: {id: "claude-opus-4-6", speed: "standard"},
      system: $system,
      skills: [
        {type: "custom", skill_id: $pid, version: "latest"},
        {type: "custom", skill_id: $bid, version: "latest"}
      ],
      tools: [
        {type: "agent_toolset_20260401", default_config: {enabled: true, permission_policy: {type: "always_allow"}}},
        {type: "custom", name: "ask_user",
         description: "Ask the user a question. Session pauses until user responds via /autopilot status.",
         input_schema: {type: "object",
           properties: {question: {type: "string"}, options: {type: "array", items: {type: "string"}}, context: {type: "string"}},
           required: ["question","context"]}}
      ]
    }')")
AGENT_ID=$(echo "$AGENT_RESP" | jq -r '.id // empty')
AGENT_VER=$(echo "$AGENT_RESP" | jq -r '.version // empty')
echo "agent_id=$AGENT_ID version=$AGENT_VER"
[ -z "$AGENT_ID" ] && { echo "FAIL agent create: $AGENT_RESP"; exit 1; }

ENV_ID_JSON=$(jq -n --arg eid "$ENV_ID" '$eid')
ENVIRONMENT_ID=$(jq -r '.environment_id' .superpowers/autopilot-config.json)
VAULT_IDS="[]"

REPO_URL="https://github.com/clsandoval/monorepo"

RESOURCES=$(jq -n \
  --arg repo "$REPO_URL" --arg gh "$GITHUB_TOKEN" \
  --arg env "$ENV_ID" --arg dlg "$DIALOGUE_ID" \
  --arg sch "$SCHEDULE_ID" --arg prof "$PROFILE_ID" \
  --arg voc "$VOCAB_ID" --arg gra "$GRAMMAR_ID" \
  '[
    {type:"github_repository", url:$repo, mount_path:"/workspace/repo", authorization_token:$gh, checkout:{type:"branch", name:"main"}},
    {type:"file", file_id:$env,  mount_path:"/workspace/.env"},
    {type:"file", file_id:$dlg,  mount_path:"/workspace/dialogue.md"},
    {type:"file", file_id:$sch,  mount_path:"/workspace/japanese/schedule.yaml"},
    {type:"file", file_id:$prof, mount_path:"/workspace/japanese/profile.yaml"},
    {type:"file", file_id:$voc,  mount_path:"/workspace/japanese/vocabulary.yaml"},
    {type:"file", file_id:$gra,  mount_path:"/workspace/japanese/grammar.yaml"}
  ]')

echo ">> Creating session"
SESS_RESP=$(curl -sS -X POST https://api.anthropic.com/v1/sessions \
  -H "$H_KEY" -H "$H_VER" -H "$H_MA" -H "$H_CT" \
  -d "$(jq -n \
    --arg aid "$AGENT_ID" --argjson av $AGENT_VER \
    --arg eid "$ENVIRONMENT_ID" --arg title "autopilot: $SLUG" \
    --argjson res "$RESOURCES" --argjson vids "$VAULT_IDS" \
    '{
      agent: {type:"agent", id:$aid, version:$av},
      environment_id: $eid,
      title: $title,
      resources: $res,
      vault_ids: $vids
    }')")
SESSION_ID=$(echo "$SESS_RESP" | jq -r '.id // empty')
echo "session_id=$SESSION_ID"
[ -z "$SESSION_ID" ] && { echo "FAIL session: $SESS_RESP"; exit 1; }

BRIEF_TEXT=$(cat <<EOF
[PIMSLEUR]

# Episode ${EP}: elizaOS/eliza — Pimsleur Japanese podcast

## PRE-WRITTEN DIALOGUE MODE — DO NOT REGENERATE

A fully pre-written, reviewed dialogue script is mounted at \`/workspace/dialogue.md\`.

**YOUR JOB:** Convert that script to the \`dialogue.json\` array format expected by \`scripts/generate.sh\`, render it to MP3, and post to Telegram. DO NOT write a new dialogue. DO NOT change the content, vocab, grammar, or structure. The script has been reviewed and approved.

Speaker mapping:
- \`ARK\` → speaker \`A\` (Charon voice)
- \`RED\` → speaker \`B\` (Kore voice)

## Outcome checklist

1. Read \`/workspace/dialogue.md\` end-to-end.
2. Convert to a JSON array of \`{speaker, text}\` objects at \`/tmp/dialogue.json\`. Preserve every JP word in kana-or-kanji. Wrap Japanese spans in double-quotes per the skill's quoting rules. Strip YAML frontmatter and segment markers from the spoken dialogue.
3. Run \`scripts/verify-dialogue.py\` on the JSON. Report CJK count + pairing check. If pairing fails (>20% unpaired), do NOT rewrite — just flag it and proceed.
4. Render with \`scripts/generate.sh /tmp/dialogue.json /tmp/ep_${EP}.mp3\` using Gemini TTS.
5. Post the MP3 to Telegram using \$TELEGRAM_BOT_TOKEN and \$TELEGRAM_CHAT_ID. Caption: "Ep ${EP}: elizaOS/eliza (flight-podcast 2026-04)".
6. Write \`/tmp/curriculum_update.yaml\` summarizing: episode number, vocab introduced, grammar introduced, review items used, CJK count.
7. Commit any script artifacts on branch \`autopilot/${SLUG}\` and push.

## Behavior notes

- The dialogue has been reworked to hit the Pimsleur quality gates (~1,600 JP chars, all vocab 4+ exposures, grammar 5+ demos, explicit em-dash glossing). It is APPROVED. Your role is rendering, not editing.
- If the verify-dialogue.py pairing check flags issues, log them for the human — don't rewrite the script.
- If you hit a blocker (TTS quota, Telegram send fail), use \`ask_user\` with specific context. Don't silently skip steps.
- Commit-and-push is nice-to-have; MP3 in Telegram is the hard deliverable.

## Curriculum context (FYI, don't use to regenerate)

- Ep 13 introduces: 性格, 役, 答える, 声, 覚える, 自分; grammar 〜ようとする
- japanese_ratio: 0.2
- The dialogue script was pre-verified against those targets.
EOF
)

echo ">> Sending brief"
curl -sS -X POST "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
  -H "$H_KEY" -H "$H_VER" -H "$H_MA" -H "$H_CT" \
  -d "$(jq -n --arg text "$BRIEF_TEXT" '{events:[{type:"user.message", content:[{type:"text", text:$text}]}]}')" \
  > /tmp/event_resp.json
echo "event response written to /tmp/event_resp.json"

STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
jq \
  --arg id "$SESSION_ID" \
  --arg brief "Ep ${EP}: elizaOS/eliza pimsleur podcast render" \
  --arg repo "$REPO_URL" \
  --arg branch "autopilot/$SLUG" \
  --arg base "main" \
  --arg aid "$AGENT_ID" \
  --arg t "$STARTED_AT" \
  '.sessions += [{id:$id, brief:$brief, repo:$repo, branch:$branch, base_branch:$base, agent_id:$aid, started_at:$t, status:"running", last_checked_at:null}]' \
  .superpowers/autopilot-sessions.json > /tmp/sess.json && mv /tmp/sess.json .superpowers/autopilot-sessions.json

echo ""
echo "=== DISPATCHED ==="
echo "session_id=$SESSION_ID"
echo "agent_id=$AGENT_ID"
echo "brief_dir=$BRIEF_DIR"
