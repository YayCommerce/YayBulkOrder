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

DEST_PATH="$BUILD_PATH/${PLUGIN_SLUG}-${BUILD_VARIANT}"

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

echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"

echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}-${BUILD_VARIANT}.zip" "${PLUGIN_SLUG}-${BUILD_VARIANT}/"
rm -rf "${PLUGIN_SLUG}-${BUILD_VARIANT}"
echo "${PLUGIN_SLUG}-${BUILD_VARIANT}.zip file generated!"

echo "Build done!"