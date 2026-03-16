#!/bin/bash
# Stop hook: Check for uncommitted changes before Claude stops
set -euo pipefail
CWD=$(echo "$(cat)" | jq -r '.cwd // ""')
if [ -z "$CWD" ] || [ ! -d "$CWD" ]; then
  CWD="${CLAUDE_PROJECT_DIR:-.}"
fi
cd "$CWD" 2>/dev/null || exit 0
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo '{}'
  exit 0
fi
CHANGES=$(git status --porcelain 2>/dev/null)
if [ -n "$CHANGES" ]; then
  FILE_COUNT=$(echo "$CHANGES" | wc -l | tr -d ' ')
  echo "There are $FILE_COUNT uncommitted file(s). Ask the user if they want to commit before ending the session." >&2
  exit 2
fi
echo '{}'
exit 0
