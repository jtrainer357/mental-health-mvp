#!/bin/bash
# PreToolUse hook: Warn when editing API route files to ensure HIPAA compliance
set -euo pipefail
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""')
case "$FILE_PATH" in
  */app/api/*|*/src/app/api/*)
    echo '{"hookSpecificOutput":{"additionalContext":"API route file detected. Per CLAUDE.md requirements, ensure this route has: (1) Zod input validation, (2) Structured logging with module context, (3) try/catch error handling, (4) Audit logging if it touches PHI, (5) RLS verification if it queries patient data."}}'
    exit 0
    ;;
  *)
    echo '{}'
    exit 0
    ;;
esac
