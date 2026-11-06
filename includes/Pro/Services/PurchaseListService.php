<?php
namespace YayBulkOrder\Pro\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static PurchaseListService get_instance()
 */
class PurchaseListService {
    use SingletonTrait;

    public const PURCHASE_LIST_POST_TYPE = 'yaybulkorder_plist';
    public const PURCHASE_LIST_META_DATA = 'yaybulkorder_purchase_list_data';
    public const PURCHASE_LIST_PER_PAGE  = 10;

    public function get_config() {
        return [
            'metadata' => [
                'isBlockTheme' => wp_is_block_theme(),
            ],
            'path'     => [
                'assetsUrl' => YAYBULKORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1' ),
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ],
            'wc_meta'  => [
                'products'     => $this->get_all_products(),
                'currencyData' => [
                    'currency'    => get_woocommerce_currency(),
                    'symbol'      => html_entity_decode( \get_woocommerce_currency_symbol(), ENT_COMPAT ),
                    'position'    => get_option( 'woocommerce_currency_pos' ),
                    'thousandSep' => wc_get_price_thousand_separator(),
                    'decimalSep'  => wc_get_price_decimal_separator(),
                    'numDecimals' => wc_get_price_decimals(),
                ],
            ],
        ];
    }

    public function get_allowed_product_types() {
        $allowed = [ 'simple', 'subscription', 'subscription_variation', 'variable', 'grouped', 'bundle' ];

        return apply_filters( 'yaybulkorder_allowed_purchase_list_product_types', $allowed );
    }

    public function get_all_products() {
        $products = wc_get_products(
            [
                'limit'                  => -1,
                'status'                 => 'publish',
                'type'                   => $this->get_allowed_product_types(),
                'update_post_meta_cache' => true,
            ]
        );

        $result = [];
        $queue  = $products;
        while ( ! empty( $queue ) ) {
            $product = array_shift( $queue );
            if ( $product->is_type( 'variable' ) ) {

                $queue = array_merge(
                    $queue,
                    array_map( 'wc_get_product', $product->get_children() )
                );
                continue;
            }//end if

            if ( $product->is_type( 'grouped' ) ) {
                $price          = $this->get_max_grouped_product_price( $product );
                $is_purchasable = (float) $price > 0.0;
            } else {
                $price          = apply_filters( 'yaybulkorder_purchase_list_product_price', (float) $product->get_price(), $product );
                $is_purchasable = apply_filters( 'yaybulkorder_purchase_list_product_is_purchasable', $product->is_purchasable(), $product );
            }

            if ( $is_purchasable ) {
                $result[] = [
                    'id'    => $product->get_id(),
                    'image' => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
                    'sku'   => $product->get_sku(),
                    'price' => $price,
                    'name'  => $product->get_name(),
                ];
            }
        }//end while

        return apply_filters( 'yaybulkorder_purchase_list_products', $result );
    }

    protected function get_max_grouped_product_price( \WC_Product $product ) {
        $price = 0;

        foreach ( $product->get_children() as $child_id ) {
            $child          = wc_get_product( $child_id );
            $is_purchasable = apply_filters( 'yaybulkorder_purchase_list_product_is_purchasable', $child->is_purchasable(), $child );
            if ( ! $child || ! $is_purchasable ) {
                continue;
            }

            $price += apply_filters( 'yaybulkorder_purchase_list_product_price', (float) $child->get_price(), $child );
        }

        return $price;
    }

    public function get_purchase_list_by_user( int $user_id ) {
        if ( $user_id < 1 ) {
            return [];
        }

        $args = [
            'post_type'              => $this::PURCHASE_LIST_POST_TYPE,
            'posts_per_page'         => -1,
            'update_post_meta_cache' => true,
            'author'                 => $user_id,
            'orderby'                => [
                'date' => 'DESC',
            ],
        ];

        $posts = get_posts( $args );

        return array_map(
            function( $post ) {
                $products = get_post_meta( $post->ID, $this::PURCHASE_LIST_META_DATA, true ) ?? [];
                return [
                    'id'         => $post->ID,
                    'name'       => $post->post_title,
                    'products'   => $products,
                    'itemsCount' => sprintf(
                        /* translators: %d: number of items in the list */
                        esc_html__( '%d items', 'yay-bulk-order' ),
                        (int) count( $products )
                    ),
                ];
            },
            $posts
        );
    }

    public function insert_purchase_list( int $user_id, string $list_name, array $list_data ) {
        $new_purchase_list = wp_insert_post(
            [
                'post_title'   => $list_name,
                'post_content' => 'Yay Bulk Order Purchase List',
                'post_status'  => 'publish',
                'post_author'  => $user_id,
                'post_type'    => $this::PURCHASE_LIST_POST_TYPE,
            ]
        );

        if ( is_wp_error( $new_purchase_list ) ) {
            return $new_purchase_list;
        }

        update_post_meta( $new_purchase_list, $this::PURCHASE_LIST_META_DATA, $list_data );

        return $new_purchase_list;
    }

    public function update_purchase_list( int $list_id, string $list_name, array $list_data ) {
        $result = wp_update_post(
            [
                'ID'         => $list_id,
                'post_title' => $list_name,
            ]
        );
        if ( is_wp_error( $result ) ) {
            return false;
        }

        $result = update_post_meta( $list_id, $this::PURCHASE_LIST_META_DATA, $list_data );

        if ( ! $result ) {
            return false;
        }

        return true;
    }

    public function get_purchase_list( int $list_id, int $user_id ) {
        $post = get_post( $list_id );
        if ( empty( $post ) || $this::PURCHASE_LIST_POST_TYPE !== $post->post_type ) {
            return [];
        }

        if ( intval( $post->post_author ) !== $user_id ) {
            return [];
        }

        $products = get_post_meta( $list_id, $this::PURCHASE_LIST_META_DATA, true );

        return [
            'id'         => $post->ID,
            'name'       => $post->post_title,
            'products'   => $products,
            'itemsCount' => sprintf(
                        /* translators: %d: number of items in the list */
                esc_html__( '%d items', 'yay-bulk-order' ),
                (int) count( $products )
            ),
        ];
    }

    public function build_purchase_list_csv( array $products ) {
        $rows = [ $this->get_csv_header() ];
        $rows = array_merge( $rows, $this->get_csv_purchase_list_products( $products ) );

        $csv_content = '';

        foreach ( $rows as $row ) {
            $escaped      = array_map( fn( $item ) => '"' . $item . '"', $row );
            $csv_content .= implode( ',', $escaped ) . "\n";
        }

        return $csv_content;
    }

    protected function get_csv_header() {
        return [
            __( 'Product ID', 'yay-bulk-order' ),
            __( 'Product Name', 'yay-bulk-order' ),
            __( 'Product SKU', 'yay-bulk-order' ),
            __( 'Quantity', 'yay-bulk-order' ),
            __( 'Total', 'yay-bulk-order' ),
        ];
    }

    protected function get_csv_purchase_list_products( array $products ) {
        $data = [];
        foreach ( $products as $product ) {
            $product_data = wc_get_product( $product['productId'] );

            if ( empty( $product_data ) ) {
                continue;
            }

            $price = apply_filters( 'yaybulkorder_purchase_list_product_price', (float) $product_data->get_price(), $product_data );

            $data[] = [
                $product_data->get_id(),
                $product_data->get_name(),
                $product_data->get_sku(),
                $product['quantity'],
                $price * $product['quantity'],
            ];
        }

        return $data;
    }
}
