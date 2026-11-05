<?php

namespace YayBulkOrder\Pro\Engines\Frontend;

use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Frontend  Class
 */
class Frontend {
    use SingletonTrait;

    private SettingsService $settings_service;

    protected function __construct() {
        $this->settings_service = SettingsService::get_instance();
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_slotfill' ] );
    }

    public function enqueue_scripts() {
        $dep           = [ 'jquery', 'wp-i18n' ];
        $script_handle = 'yay-bulk-order-scripts';

        wp_enqueue_script( $script_handle, YAYBULKORDER_PLUGIN_URL . 'assets/pro/js/front-store-script.js', $dep, YAYBULKORDER_VERSION, false );
        wp_enqueue_style( 'yay-bulk-order-styles', YAYBULKORDER_PLUGIN_URL . 'assets/pro/css/front-store-style.css', [], YAYBULKORDER_VERSION );

        $meta = [
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'wp_rest' ),
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
        wp_set_script_translations( $slug, 'yay-bulk-order' );

        wp_localize_script(
            $slug,
            'yayBulkOrderSlotFill',
            [
                'ybo_meta' => [
                    'settings' => $this->settings_service->get_settings(),
                ],
                'wc_meta'  => [
                    'isCheckout' => is_checkout(),
                    'isCart'     => is_cart(),
                ],
            ]
        );
    }
}
