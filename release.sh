PLUGIN_SLUG="yay-bulk-order"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/release"
DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

#
# 1) Build Admin App
#
echo "Installing Admin App dependencies..."
cd "$PROJECT_PATH/apps/admin-page"
pnpm install
echo "Running JS Build..."
pnpm build
cd "$PROJECT_PATH"

#
# 2) Build Packages
#
cd "$PROJECT_PATH/apps/packages/utils"
pnpm install
echo "Running Utils Package JS Build..."
pnpm build
cd "$PROJECT_PATH"

#
# 3) Build Block
#
cd "$PROJECT_PATH/apps/blocks/"
pnpm install
echo "Running Request Form Block JS Build..."
pnpm build
cd "$PROJECT_PATH"


#
# 4) Copy files
#
echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

#
# 5) Run code formatter if tools directory exists before running lint
#
if [ -d "$PROJECT_PATH/tools" ]; then
    echo "Running PHP Code Beautifier..."
    cd "$PROJECT_PATH/tools"
    composer run cbf ../build
    cd "$PROJECT_PATH"
fi

#
# 6) Remove development-only code
#
sed -i "" "/YAY_BULK_ORDER_IS_DEVELOPMENT/d" "$DEST_PATH/yay-bulk-order.php"
rm -rf "$DEST_PATH/includes/Engines/Register/RegisterDev.php"
#
# 7) Generate ZIP
#
echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$PLUGIN_SLUG"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"