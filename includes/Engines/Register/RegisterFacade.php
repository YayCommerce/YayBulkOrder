<?php
namespace YayBulkOrder\Engines\Register;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Engines\Register\ScriptName;

defined( 'ABSPATH' ) || exit;

/**
 * Register Facade.
 *
 * @method static RegisterFacade get_instance()
 */
class RegisterFacade {
    use SingletonTrait;

    /**
     * Blocks whose frontend script modules call `wp.i18n`. Script modules get
     * no JS translations before WordPress 7.0, so these blocks enqueue
     * ScriptName::MODULE_I18N when they render.
     */
    private const BLOCKS_WITH_MODULE_I18N = [
        'yay-bulk-order/purchase-list',
        'yay-bulk-order/quick-csv-order',
    ];

    private bool $has_module_translations = false;

    /** Hooks Initialization */
    private function __construct() {
        add_action( 'init', [ $this, 'register_all_assets' ] );
        add_filter( 'pre_load_script_translations', [ $this, 'use_mo_file_for_script_translations' ], 10, 4 );
        add_filter( 'script_loader_tag', [ $this, 'add_entry_as_module' ], 10, 2 );

        foreach ( self::BLOCKS_WITH_MODULE_I18N as $block_name ) {
            add_filter( 'render_block_' . $block_name, [ $this, 'enqueue_module_translations' ] );
        }

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

        wp_register_script( ScriptName::MODULE_I18N, false, [ 'wp-i18n' ], YAYBULKORDER_VERSION, true );

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
     * Print the admin app as type="module". It is registered as a classic
     * script so wp_set_script_translations() and wp_localize_script() work.
     *
     * @param string $tag    The script tag.
     * @param string $handle The script handle.
     * @return string
     */
    public function add_entry_as_module( $tag, $handle ) {
        if ( ScriptName::ADMIN_PAGE !== $handle ) {
            return $tag;
        }

        if ( strpos( $tag, ' type="' ) !== false ) {
            return preg_replace( '/\stype="[^"]*"/', ' type="module"', $tag, 1 );
        }

        return str_replace( ' src=', ' type="module" src=', $tag );
    }

    /**
     * Load the MO translations into `wp.i18n` before the block's script
     * modules run. Modules are deferred, so this footer script runs first.
     *
     * @param string $block_content Rendered block HTML, returned as is.
     * @return string
     */
    public function enqueue_module_translations( $block_content ) {
        // A flag, not wp_script_is(): WordPress dequeues a block's assets
        // when it renders empty, and the inline data must be added once.
        if ( ! $this->has_module_translations ) {
            $this->has_module_translations = true;
            wp_add_inline_script(
                ScriptName::MODULE_I18N,
                sprintf(
                    'wp.i18n.setLocaleData( %s.locale_data.messages, "yay-bulk-order" );',
                    $this->get_mo_script_translations()
                )
            );
        }
        wp_enqueue_script( ScriptName::MODULE_I18N );

        return $block_content;
    }

    /**
     * Yay Bulk Order Scripts translations is all in MO file.
     *
     * Applies to every classic script in the `yay-bulk-order` domain: the
     * block editor scripts (WordPress sets their translations from block.json
     * `textdomain`) and the checkout slotfill. Loco Translate and bundled
     * translations ship only .po/.mo, so there are no JSON files to read.
     *
     * @param string $json_translations
     * @param string $file
     * @param string $handle
     * @param string $domain
     */
    public function use_mo_file_for_script_translations( $json_translations, $file, $handle, $domain ) {
        if ( 'yay-bulk-order' !== $domain ) {
            return $json_translations;
        }

        return $this->get_mo_script_translations();
    }

    /**
     * Convert the loaded `yay-bulk-order` MO translations to the JSON format
     * that `wp.i18n` reads.
     *
     * @return string
     */
    private function get_mo_script_translations(): string {
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
            ],
            JSON_HEX_TAG | JSON_HEX_AMP
        );
    }
}
