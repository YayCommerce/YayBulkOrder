#!/usr/bin/env bash
# Stop hook: build the Pro Gutenberg blocks, but only if this turn touched
# apps/blocks-pro or a package it depends on (common, product-table-store,
# variant-table-store, purchase-list-store).
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
source "$root/.claude/hooks/_lib.sh"

has_changes apps/blocks-pro apps/packages/common apps/packages/product-table-store \
    apps/packages/variant-table-store apps/packages/purchase-list-store || exit 0

log=$(mktemp)
if ! pnpm run build:pro > "$log" 2>&1; then
    report_failure "Pro blocks build (pnpm run build:pro)" "$log"
fi
rm -f "$log"
