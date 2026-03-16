#!/bin/bash
# PostToolUse hook: After Edit/Write on source files, remind about build verification
set -euo pipefail
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""')
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.css)
    echo '{"hookSpecificOutput":{"additionalContext":"Source file modified. After you finish batching your current edits, run `npm run build` to verify zero TypeScript errors before moving on."}}'
    exit 0
    ;;
  *)
    echo '{}'
    exit 0
    ;;
esac
