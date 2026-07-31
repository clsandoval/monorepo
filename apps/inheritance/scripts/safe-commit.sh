#!/usr/bin/env bash
#
# safe-commit.sh — the only sanctioned way to commit in this repository.
#
#   bash apps/inheritance/scripts/safe-commit.sh -m "<message>" <path> [<path> ...]
#   bash apps/inheritance/scripts/safe-commit.sh --dry-run -m "<message>" <path> ...
#
# This app lives inside a monorepo with a CONCURRENT AUTO-COMMITTER. Unrelated
# commits ("fitness log", "lessons: ...", "bot: ...") land while we work. That
# creates damage in both directions:
#
#   - a broad stage on our side absorbs the auto-committer's in-flight edits into
#     our commit;
#   - the auto-committer's own broad stage absorbs OUR staged work into a commit
#     named something like "fitness log", where nobody will ever find it.
#
# A broad stage cannot be blocked outright from inside a plan, because the
# executor has a shell. What this script does is make the correct path SHORTER
# than the wrong one, and make every broad-stage form a hard refusal here instead
# of a silent success.
#
# Exit codes: 0 on a successful commit (or a clean --dry-run), 1 on any refusal
# or git failure. There is no other exit code and no override flag.

set -euo pipefail

refuse() {
  echo "REFUSED: $*" >&2
  exit 1
}

# --- argument parsing -------------------------------------------------------

MESSAGE=""
DRY_RUN=false
HAVE_MESSAGE=false
PATHS=()

while [ $# -gt 0 ]; do
  case "$1" in
    -m)
      [ $# -ge 2 ] || refuse "-m requires a message argument"
      MESSAGE="$2"
      HAVE_MESSAGE=true
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -A|--all|-a|.|./|:/|'*')
      # These are the broad-stage forms. Each one would sweep in whatever the
      # auto-committer happens to have modified at this instant.
      refuse "'$1' is a broad stage. Name explicit file paths instead."
      ;;
    -*)
      refuse "'$1' looks like a flag. Only -m and --dry-run are accepted, and a path may never begin with '-'."
      ;;
    *)
      PATHS+=("$1")
      shift
      ;;
  esac
done

[ "$HAVE_MESSAGE" = true ] || refuse "no commit message. Use -m \"<message>\"."
[ -n "$MESSAGE" ] || refuse "the commit message is empty."
[ "${#PATHS[@]}" -gt 0 ] || refuse "no paths given. This script never stages anything you did not name."

# --- always operate from the git root ---------------------------------------
# A caller's working directory must not change which paths get staged.

GIT_ROOT="$(git rev-parse --show-toplevel)" || refuse "not inside a git repository."
cd "$GIT_ROOT"

# --- allowlist --------------------------------------------------------------
# Anything under apps/inheritance/, plus the one CI workflow file that belongs to
# this app. A path outside that set is somebody else's work.

ALLOWED_EXACT=".github/workflows/inheritance-ci.yml"

for p in "${PATHS[@]}"; do
  case "$p" in
    apps/inheritance/*) ;;
    "$ALLOWED_EXACT") ;;
    *)
      refuse "'$p' is outside apps/inheritance/ (and is not $ALLOWED_EXACT). This script never commits another area's work."
      ;;
  esac
done

# --- the index must be empty before we stage --------------------------------
# A pre-populated index means another process staged something. Committing on top
# of it is precisely the absorption this script exists to prevent. The operator
# resolves it with `git restore --staged <path>` — never this script, which must
# not make decisions about somebody else's staged work.

PRESTAGED="$(git diff --cached --name-only)"
if [ -n "$PRESTAGED" ]; then
  echo "REFUSED: the index is not empty. Something else already staged:" >&2
  echo "$PRESTAGED" | sed 's/^/  /' >&2
  echo "Resolve with: git restore --staged <path>" >&2
  exit 1
fi

# --- stage exactly what was named -------------------------------------------
# The `--` separator is mandatory: without it a path could be read as a flag.

git add -- "${PATHS[@]}"

# --- verify the staged set matches the requested set ------------------------
# A requested directory legitimately expands to the files under it, so the rule
# is that every staged path must equal, or lie under, one of the requested paths.
# Anything else means the stage reached further than we asked.

UNEXPECTED=()
while IFS= read -r staged; do
  [ -z "$staged" ] && continue
  ok=false
  for p in "${PATHS[@]}"; do
    clean="${p%/}"
    if [ "$staged" = "$clean" ] || case "$staged" in "$clean"/*) true;; *) false;; esac; then
      ok=true
      break
    fi
  done
  if [ "$ok" = false ]; then
    UNEXPECTED+=("$staged")
  fi
done < <(git diff --cached --name-only)

if [ "${#UNEXPECTED[@]}" -gt 0 ]; then
  echo "REFUSED: the stage reached paths that were not requested:" >&2
  printf '  %s\n' "${UNEXPECTED[@]}" >&2
  git restore --staged -- "${UNEXPECTED[@]}"
  echo "Those paths have been unstaged. No commit was made." >&2
  exit 1
fi

STAGED_COUNT="$(git diff --cached --name-only | wc -l | tr -d ' ')"

if [ "$DRY_RUN" = true ]; then
  git restore --staged -- "${PATHS[@]}"
  echo "SAFE COMMIT DRY RUN OK — $STAGED_COUNT path(s) would be committed; index restored, nothing written."
  exit 0
fi

git commit -m "$MESSAGE"

NEW_SHA="$(git rev-parse HEAD)"
echo "SAFE COMMIT OK — $NEW_SHA, $STAGED_COUNT path(s) committed"
