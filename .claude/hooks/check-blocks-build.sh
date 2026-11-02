#!/usr/bin/env bash
# Stop hook: build the Lite Gutenberg blocks, but only if this turn touched
# apps/blocks or a package it depends on (common, product-table-store).
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
source "$root/.claude/hooks/_lib.sh"

has_changes apps/blocks apps/packages/common apps/packages/product-table-store || exit 0

log=$(mktemp)
if ! pnpm run build > "$log" 2>&1; then
    report_failure "Lite blocks build (pnpm run build)" "$log"
fi
rm -f "$log"
