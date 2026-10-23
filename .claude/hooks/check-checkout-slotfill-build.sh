#!/usr/bin/env bash
# Stop hook: build the checkout slotfill package, but only if this turn
# touched it or `common`. This package is Pro-only (consumed by
# includes/Pro/Engines/Frontend/Frontend.php) and isn't a dependency of
# blocks-pro or app-admin, so `pnpm build`/`build:pro` never pull it in on
# their own - it needs this dedicated script. `release.sh` now calls the
# same `pnpm run build:checkout-slotfill` in its Pro branch (fixed
# 2026-09-22 - see context-project-structure.md "Known inconsistencies"
# for the history of this gap).
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
source "$root/.claude/hooks/_lib.sh"

has_changes apps/packages/block-checkout-slotfill apps/packages/common || exit 0

log=$(mktemp)
if ! pnpm run build:checkout-slotfill > "$log" 2>&1; then
    report_failure "Checkout slotfill build" "$log"
fi
rm -f "$log"
