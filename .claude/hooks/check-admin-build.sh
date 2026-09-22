#!/usr/bin/env bash
# Stop hook: typecheck+build the admin SPA, but only if this turn actually
# touched it (or its shared `common` package) - skips instantly otherwise.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
source "$root/.claude/hooks/_lib.sh"

has_changes apps/app-admin apps/packages/common || exit 0

log=$(mktemp)
if ! pnpm run build:admin:lite > "$log" 2>&1; then
    report_failure "Admin SPA build (build:admin:lite)" "$log"
fi
rm -f "$log"
