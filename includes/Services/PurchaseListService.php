<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static PurchaseListService get_instance()
 */
class PurchaseListService {
    use SingletonTrait;

    public const PURCHASE_LIST_POST_TYPE = 'ybo_purchase_list';

    public function get_config() {
        $products = wc_get_products(
            [
                'limit'  => -1,
                'status' => 'publish',
            ]
        );

        $products = array_map(
            fn( $product ) => ( [
                'id'    => $product->get_id(),
                'image' => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
                'sku'   => $product->get_sku(),
                'price' => $product->get_price(),
                'name'  => $product->get_name(),
            ] ),
            $products
        );

        return [
            'metadata' => [
                'isBlockTheme' => wp_is_block_theme(),
                'products'     => $products,
            ],
            'path'     => [
                'assetsUrl' => YAYBULKORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1' ),
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ],
        ];
    }
}
