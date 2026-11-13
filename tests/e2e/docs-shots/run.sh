#!/usr/bin/env bash
# Docs screenshots: pnpm docs:shots [name…]
# Starts the docs site (port 8891, its own data), seeds the demo with seed.php,
# then saves each shot in shots.spec.ts, or the ones named, as WebP into the
# docs repo. YBO_DOCS_DIR changes the folder. The docs repo is never committed
# here: review and commit the images there.
set -eo pipefail

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG=docs-shots/.wp-env.json
OUT=${YBO_DOCS_DIR:-$HOME/Projects/YayCommerceDocs/yaybulkorder/.gitbook/assets}

[[ -d $OUT ]] || { echo "No $OUT. Set YBO_DOCS_DIR to the docs assets folder."; exit 1; }
command -v cwebp >/dev/null || { echo "No cwebp. Install it: brew install webp"; exit 1; }
[[ -d $E2E_DIR/../../assets/dist/blocks ]] || { echo "No built JS. Run: pnpm build && pnpm build:pro && pnpm build:admin:pro"; exit 1; }

cd "$E2E_DIR"
curl -s -o /dev/null --max-time 5 http://localhost:8891/ || npx wp-env start --config "$CONFIG"
# By path inside the container, not piped: from a terminal wp-env gives the container a TTY, which takes no stdin.
PLUGIN_SLUG=$(basename "$(cd "$E2E_DIR/../.." && pwd)")
npx wp-env run cli --config "$CONFIG" wp eval-file "wp-content/plugins/$PLUGIN_SLUG/tests/e2e/docs-shots/seed.php"

WP_ENV_CONFIG=$CONFIG DOCS_SHOTS_OUT=$OUT DOCS_SHOTS="$*" npx playwright test -c docs-shots/playwright.config.ts
echo "Shots in $OUT (PNGs: $E2E_DIR/docs-shots/png)"
