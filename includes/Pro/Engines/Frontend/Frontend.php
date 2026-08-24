<?php

namespace YayBulkOrder\Pro\Engines\Frontend;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Frontend  Class
 */
class Frontend {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_slotfill' ] );
    }

    public function enqueue_scripts() {
        $dep           = [ 'jquery', 'wp-i18n' ];
        $script_handle = 'yay-wholesale-scripts';

        wp_enqueue_script( $script_handle, YAYBULKORDER_PLUGIN_URL . 'assets/pro/js/front-store-script.js', $dep, YAYBULKORDER_VERSION, false );
        wp_enqueue_style( 'yay-wholesale-styles', YAYBULKORDER_PLUGIN_URL . 'assets/pro/css/front-store-style.css', [], YAYBULKORDER_VERSION );

        $meta = [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'wp_rest' ),
            'i18n'    => [
                'promptListName' => __( 'Name this purchase list:', 'yay-bulk-order' ),
                'saved'          => __( 'Purchase list saved.', 'yay-bulk-order' ),
                'error'          => __( 'Something went wrong. Please try again.', 'yay-bulk-order' ),
            ],
        ];

        wp_localize_script(
            $script_handle,
            'yayBulkOrder',
            $meta,
        );
    }

    public function enqueue_slotfill() {
        $asset_path = YAYBULKORDER_PLUGIN_PATH . 'assets/dist/block-checkout-slotfill/block-checkout-slotfill.asset.php';
        if ( ! file_exists( $asset_path ) ) {
            return;
        }

        $slug  = 'ybo_checkout_actions';
        $asset = include $asset_path;

        wp_enqueue_script(
            $slug,
            YAYBULKORDER_PLUGIN_URL . 'assets/dist/block-checkout-slotfill/block-checkout-slotfill.js',
            array_merge( $asset['dependencies'], [ 'wc-blocks-checkout' ] ),
            $asset['version'],
            true
        );
    }
}
