PLUGIN_SLUG="yay-bulk-order"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/release"
DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

#
# 1) Build All JS Packages, Apps, Blocks
#
echo "Installing Admin App dependencies..."
cd "$PROJECT_PATH/apps"
pnpm install
echo "Running JS Build..."
pnpm build
cd "$PROJECT_PATH"

#
# 2) Copy files
#
echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

#
# 3) Run code formatter if tools directory exists before running lint
#
if [ -d "$PROJECT_PATH/tools" ]; then
    echo "Running PHP Code Beautifier..."
    cd "$PROJECT_PATH/tools"
    composer run cbf ../build
    cd "$PROJECT_PATH"
fi

#
# 4) Remove development-only code
#
rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"

#
# 5) Generate ZIP
#
echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$PLUGIN_SLUG"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"