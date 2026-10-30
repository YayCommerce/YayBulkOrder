<?php
namespace YayBulkOrder\Engines\Register;

defined( 'ABSPATH' ) || exit;

/** Script name constants */
class ScriptName {

    public const ADMIN_PAGE       = 'yay-bulk-order/app-admin';
    public const STYLE_ADMIN_PAGE = 'yay-bulk-order/style/app-admin';

    // The admin app is a classic script printed as type="module" (see
    // RegisterFacade::add_entry_as_module), so WordPress handles its deps,
    // localized data and translations.
    public const ADMIN_PAGE_DEPS = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n', 'wp-date' ];

    public const PRODUCT_TABLE_STORE  = 'yay-bulk-order/product-table-store';
    public const VARIANT_TABLE_STORE  = 'yay-bulk-order/variant-table-store';
    public const PURCHASE_LIST_STORE  = 'yay-bulk-order/purchase-list-store';

    // Classic, src-less handle that feeds `wp.i18n` for frontend script modules.
    public const MODULE_I18N = 'yay-bulk-order/module-i18n';
}
