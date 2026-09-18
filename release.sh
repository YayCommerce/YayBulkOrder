#!/usr/bin/env bash
# Run with php 8.3:
# PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" ./release.sh IS_PRO=true
set -euo pipefail

PLUGIN_SLUG="yay-bulk-order"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/release"
PHP_BIN="${PHP_BIN:-php}"

# --- Parse IS_PRO=true/false argument ---
IS_PRO=""
for ARG in "$@"; do
    case "$ARG" in
        IS_PRO=*)
            IS_PRO="${ARG#IS_PRO=}"
            ;;
    esac
done

if [ "$IS_PRO" = "true" ]; then
    BUILD_VARIANT="pro"
elif [ "$IS_PRO" = "false" ]; then
    BUILD_VARIANT="lite"
else
    echo "Select build variant:"
    echo "  1) Lite"
    echo "  2) Pro"
    read -rp "Enter choice: " CHOICE
    CHOICE_LOWER=$(echo "$CHOICE" | tr '[:upper:]' '[:lower:]')
    case "$CHOICE_LOWER" in
        1|lite) BUILD_VARIANT="lite" ;;
        2|pro)  BUILD_VARIANT="pro" ;;
        *)
            echo "Error: invalid choice '$CHOICE'. Enter 1, 2, Lite, or Pro." >&2
            exit 1
            ;;
    esac
fi

if [ "$BUILD_VARIANT" = "pro" ]; then
    PACKAGE_SLUG="${PLUGIN_SLUG}-pro"
else
    PACKAGE_SLUG="${PLUGIN_SLUG}"
fi

DEST_PATH="$BUILD_PATH/${PACKAGE_SLUG}"

echo "==> Building variant: $(echo "$BUILD_VARIANT" | tr '[:lower:]' '[:upper:]')"

PHP_MAJOR=$("$PHP_BIN" -r 'echo PHP_MAJOR_VERSION;')
PHP_MINOR=$("$PHP_BIN" -r 'echo PHP_MINOR_VERSION;')

if [ "$PHP_MAJOR" -lt 8 ] || { [ "$PHP_MAJOR" -eq 8 ] && [ "$PHP_MINOR" -lt 3 ]; }; then
    echo "Error: the build toolchain needs PHP 8.3, found ${PHP_MAJOR}.${PHP_MINOR} ($PHP_BIN)." >&2
    echo "       PATH=\"/opt/homebrew/opt/php@8.3/bin:\$PATH\" ./release.sh IS_PRO=true" >&2
    exit 1
fi

if [ "$PHP_MAJOR" -ne 8 ] || [ "$PHP_MINOR" -ne 3 ]; then
    echo "Warning: building with PHP ${PHP_MAJOR}.${PHP_MINOR}, composer.json pins the platform to 8.3."
fi

./vendor/bin/yaycommerce-prerelease

echo "Generating build directory..."
rm -rf "$DEST_PATH"
mkdir -p "$DEST_PATH"

echo "Installing dependencies..."
pnpm install

echo "Running Admin App Build (${BUILD_VARIANT})..."
pnpm run "build:admin:${BUILD_VARIANT}"

echo "Running Block JS Build..."
pnpm run build

if [ "$BUILD_VARIANT" = "pro" ]; then
    echo "Running Block JS Build (Pro)..."
    pnpm run build:pro
fi

echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"

if [ "$BUILD_VARIANT" = "lite" ]; then
    echo "Stripping Pro-only files from Lite build..."
    # `YayBulkOrder::is_pro()` gates the plugin on whether `includes/Pro/`
    # (PSR-4 autoloaded as `YayBulkOrder\Pro\`) is present at all, not on a
    # license check — a Lite build must not ship it, or a Lite install
    # would activate its Pro code path. `assets/dist/blocks-pro` is the
    # built counterpart of that same code and equally Pro-only.
    rm -rf "$DEST_PATH/includes/Pro"
    rm -rf "$DEST_PATH/assets/pro"
    rm -rf "$DEST_PATH/assets/dist/blocks-pro"
    rm -rf "$DEST_PATH/assets/dist/variant-table-store"
    rm -rf "$DEST_PATH/assets/dist/purchase-list-store"

    cp "$PROJECT_PATH/composer.json" "$DEST_PATH/composer.json"
    [ -f "$PROJECT_PATH/composer.lock" ] && cp "$PROJECT_PATH/composer.lock" "$DEST_PATH/composer.lock"
    composer dump-autoload --optimize --no-dev --working-dir="$DEST_PATH"
    rm -f "$DEST_PATH/composer.json" "$DEST_PATH/composer.lock"
else
    cp "$DEST_PATH/assets/pro/yay-bulk-order-pro.php" "$DEST_PATH/"
    rm "$DEST_PATH/assets/pro/yay-bulk-order-pro.php"
    rm "$DEST_PATH/yay-bulk-order.php"
fi

echo "Generating zip file..."
cd "$BUILD_PATH" || exit
# `zip -r` updates an existing archive in place — it never removes an entry
# whose file is no longer on disk — so a stale zip from a previous run (e.g.
# before a file got stripped or renamed) would keep carrying it forever.
# Delete any previous zip first so this run's is a clean, exact reflection
# of $DEST_PATH.
rm -f "${PACKAGE_SLUG}.zip"
zip -q -r "${PACKAGE_SLUG}.zip" "${PACKAGE_SLUG}/"
rm -rf "${PACKAGE_SLUG}"
echo "${PACKAGE_SLUG}.zip file generated!"

echo "Build done!"
