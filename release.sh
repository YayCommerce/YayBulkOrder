#!/usr/bin/env bash
# Run with php 8.3:
# PATH="/opt/homebrew/opt/php@8.3/bin:$PATH" ./release.sh
set -euo pipefail

PLUGIN_SLUG="yay-bulk-order"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/release"
PHP_BIN="${PHP_BIN:-php}"

# --- Select build variant: Pro or Lite ---
# You can also pass it directly: ./release.sh pro   or   ./release.sh lite
BUILD_VARIANT="${1:-}"

if [ -z "$BUILD_VARIANT" ]; then
    echo "Select build variant:"
    echo "  1) Lite"
    echo "  2) Pro"
    read -rp "Enter choice: " CHOICE
    CHOICE_LOWER=$(echo "$CHOICE" | tr '[:upper:]' '[:lower:]')

    case "$CHOICE_LOWER" in
        1|lite)
            BUILD_VARIANT="lite"
            ;;
        2|pro)
            BUILD_VARIANT="pro"
            ;;
        *)
            echo "Error: invalid choice '$CHOICE'. Enter 1, 2, Lite, or Pro." >&2
            exit 1
            ;;
    esac
else
    BUILD_VARIANT=$(echo "$BUILD_VARIANT" | tr '[:upper:]' '[:lower:]')
    if [ "$BUILD_VARIANT" != "pro" ] && [ "$BUILD_VARIANT" != "lite" ]; then
        echo "Error: argument must be 'pro' or 'lite', got '$BUILD_VARIANT'." >&2
        exit 1
    fi
fi

# DEST_PATH now depends on BUILD_VARIANT, so it's set here
DEST_PATH="$BUILD_PATH/${PLUGIN_SLUG}-${BUILD_VARIANT}"

echo "==> Building variant: $(echo "$BUILD_VARIANT" | tr '[:lower:]' '[:upper:]')"

PHP_MAJOR=$("$PHP_BIN" -r 'echo PHP_MAJOR_VERSION;')
PHP_MINOR=$("$PHP_BIN" -r 'echo PHP_MINOR_VERSION;')

if [ "$PHP_MAJOR" -lt 8 ] || { [ "$PHP_MAJOR" -eq 8 ] && [ "$PHP_MINOR" -lt 3 ]; }; then
    echo "Error: the build toolchain needs PHP 8.3, found ${PHP_MAJOR}.${PHP_MINOR} ($PHP_BIN)." >&2
    echo "       PATH=\"/opt/homebrew/opt/php@8.3/bin:\$PATH\" ./release.sh" >&2
    exit 1
fi

if [ "$PHP_MAJOR" -ne 8 ] || [ "$PHP_MINOR" -ne 3 ]; then
    echo "Warning: building with PHP ${PHP_MAJOR}.${PHP_MINOR}, composer.json pins the platform to 8.3."
fi

./vendor/bin/yaycommerce-prerelease

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

echo "Installing dependencies..."
pnpm install

echo "Running Admin App Build (${BUILD_VARIANT})..."
pnpm run "build:admin:${BUILD_VARIANT}"

echo "Running Block JS Build..."
pnpm run build:blocks

echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"

echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}-${BUILD_VARIANT}.zip" "${PLUGIN_SLUG}-${BUILD_VARIANT}/"
rm -rf "${PLUGIN_SLUG}-${BUILD_VARIANT}"
echo "${PLUGIN_SLUG}-${BUILD_VARIANT}.zip file generated!"

echo "Build done!"