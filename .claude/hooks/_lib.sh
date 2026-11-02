#!/usr/bin/env bash
# Shared helpers for the Stop-hook build checks in this directory.
# Sourced by check-*.sh — not meant to be run directly.

# has_changes <path> [<path> ...]
# True if any of the given paths (relative to repo root) have uncommitted
# changes (modified, staged, or untracked). Used to skip a build check
# entirely when its inputs didn't change.
has_changes() {
    git status --porcelain -- "$@" 2>/dev/null | grep -q .
}

# report_failure <label> <log-file>
# Prints the {"decision":"block",...} JSON Claude Code hooks expect, with
# the log's last 40 lines escaped into valid JSON (backslashes, quotes,
# then real newlines -> literal \n) so the reason string parses cleanly.
report_failure() {
    local label="$1"
    local log_file="$2"
    local escaped
    # awk (not sed's `N`/label loop) for the per-line -> literal-\n join:
    # that sed idiom is GNU-only and breaks on macOS's default BSD sed.
    escaped=$(tail -n 40 "$log_file" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}')
    printf '{"decision":"block","reason":"%s failed - fix before finishing:\\n%s"}\n' "$label" "$escaped"
}
