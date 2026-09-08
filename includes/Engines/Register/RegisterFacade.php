<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Engines\Register\ScriptName;

/**
 * Register Facade.
 *
 * @method static RegisterFacade get_instance()
 */
class RegisterFacade {
    use SingletonTrait;

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'init', [ $this, 'register_all_assets' ] );
        add_filter( 'pre_load_script_translations', [ $this, 'use_mo_file_for_script_translations' ], 10, 4 );

        $is_prod = ! defined( 'YAYBULKORDER_IS_DEVELOPMENT' ) || YAYBULKORDER_IS_DEVELOPMENT !== true;
        if ( $is_prod && class_exists( '\YayBulkOrder\Engines\Register\RegisterProd' ) ) {
            \YayBulkOrder\Engines\Register\RegisterProd::get_instance();
        } elseif ( ! $is_prod && class_exists( '\YayBulkOrder\Engines\Register\RegisterDev' ) ) {
            \YayBulkOrder\Engines\Register\RegisterDev::get_instance();
        }
    }

    public function register_all_assets() {
        wp_register_style( ScriptName::STYLE_ADMIN_PAGE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/page-admin/style.css', [], YAYBULKORDER_VERSION );

        $module_asset = require_once YAYBULKORDER_PLUGIN_PATH . 'assets/dist/product-table-store/product-table-store.asset.php';
        wp_register_script_module( ScriptName::PRODUCT_TABLE_STORE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/product-table-store/product-table-store.js', $module_asset['dependencies'], $module_asset['version'] );
        wp_set_script_translations( ScriptName::PRODUCT_TABLE_STORE, 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . 'languages' );

        // Pro-only: `assets/dist/variant-table-store` and
        // `.../purchase-list-store` aren't shipped in a Lite build (see
        // release.sh), so only touch them once `includes/Pro` — and
        // therefore Pro itself — is actually present.
        if ( \YayBulkOrder\YayBulkOrder::is_pro() ) {
            $module_asset = require_once YAYBULKORDER_PLUGIN_PATH . 'assets/dist/variant-table-store/variant-table-store.asset.php';
            wp_register_script_module( ScriptName::VARIANT_TABLE_STORE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/variant-table-store/variant-table-store.js', $module_asset['dependencies'], $module_asset['version'] );
            wp_set_script_translations( ScriptName::VARIANT_TABLE_STORE, 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . 'languages' );

            $module_asset = require_once YAYBULKORDER_PLUGIN_PATH . 'assets/dist/purchase-list-store/purchase-list-store.asset.php';
            wp_register_script_module( ScriptName::PURCHASE_LIST_STORE, YAYBULKORDER_PLUGIN_URL . 'assets/dist/purchase-list-store/purchase-list-store.js', $module_asset['dependencies'], $module_asset['version'] );
            wp_set_script_translations( ScriptName::PURCHASE_LIST_STORE, 'yay-bulk-order', YAYBULKORDER_PLUGIN_PATH . 'languages' );
        }
    }

    /**
     * Yay Bulk Order Scripts translations is all in MO file.
     *
     * @param string $json_translations
     * @param string $file
     * @param string $handle
     * @param string $domain
     */
    public function use_mo_file_for_script_translations( $json_translations, $file, $handle, $domain ) {
        $all_handles = [
            ScriptName::ADMIN_PAGE,
        ];

        if ( 'yay-bulk-order' !== $domain || ! in_array( $handle, $all_handles, true ) ) {
            return $json_translations;
        }

        $translations = get_translations_for_domain( 'yay-bulk-order' );
        $messages     = [
            '' => [
                'domain' => 'messages',
            ],
        ];
        $entries      = $translations->entries;
        foreach ( $entries as $key => $entry ) {
            $messages[ $entry->singular ] = $entry->translations;
        }

        return wp_json_encode(
            [
                'domain'      => 'messages',
                'locale_data' => [
                    'messages' => $messages,
                ],
            ]
        );
    }
}
