<?php
namespace YayBulkOrder\Pro\Engines\Blocks;

use YayBulkOrder\Pro\Services\PurchaseListService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Purchase List Blocks
 */
class PurchaseList {
    use SingletonTrait;

    private PurchaseListService $purchase_list_service;

    protected function __construct() {
        $this->purchase_list_service = PurchaseListService::get_instance();

        // Register new post type
        add_action( 'init', [ $this, 'register_purchase_list_post_type' ] );

        // Ajax
        add_action( 'wp_ajax_ybo_add_purchase_list_to_cart', [ $this, 'add_purchase_list_to_cart' ] );
        add_action( 'wp_ajax_ybo_save_purchase_list_from_cart', [ $this, 'save_purchase_list_from_cart' ] );
        add_action( 'wp_ajax_ybo_save_purchase_list_from_order', [ $this, 'save_purchase_list_from_order' ] );

        // Save From Cart UI
        // Classic
        add_action( 'woocommerce_widget_shopping_cart_after_buttons', [ $this, 'save_from_minicart_button' ] );
        add_action( 'woocommerce_cart_actions', [ $this, 'save_from_cart_button' ] );
        add_action( 'woocommerce_review_order_after_submit', [ $this, 'save_from_cart_button' ] );

        // Block
        add_filter( 'render_block_woocommerce/mini-cart-footer-block', [ $this, 'add_to_block_component' ], 999 );

        // Other
        add_action( 'woocommerce_order_details_after_order_table', [ $this, 'save_from_order_button' ] );

        // Add to My Account
        add_filter( 'woocommerce_account_menu_items', [ $this, 'add_menu_purchase_list' ] );
        add_action( 'woocommerce_account_ybo-purchase-list-page_endpoint', [ $this, 'render_menu_purchase_list' ] );
    }

    /**
     * Register the "purchase list" custom post type and, on block themes,
     * add the "ybo-purchase-list-page" My Account rewrite endpoint.
     *
     * @return void
     */
    public function register_purchase_list_post_type() {
        $post_type = $this->purchase_list_service::PURCHASE_LIST_POST_TYPE;
        $labels    = [
            'name'          => __( 'Purchase Lists', 'yay-bulk-order' ),
            'singular_name' => __( 'Purchase List', 'yay-bulk-order' ),
        ];
        $args      = [
            'labels'            => $labels,
            'description'       => __( 'Customer purchase lists', 'yay-bulk-order' ),
            'public'            => false,
            'show_ui'           => false,
            'has_archive'       => false,
            'show_in_admin_bar' => false,
            'show_in_rest'      => true,
            'show_in_menu'      => false,
            'query_var'         => false,
            'supports'          => [
                'title',
                'author',
            ],
            'capabilities'      => [
                'edit_post'          => 'read',
                'read_post'          => 'read',
                'delete_post'        => 'read',
                'edit_posts'         => 'read',
                'edit_others_posts'  => 'manage_options',
                'delete_posts'       => 'manage_options',
                'publish_posts'      => 'manage_options',
                'read_private_posts' => 'manage_options',
            ],
        ];

        register_post_type( $post_type, $args );

        add_rewrite_endpoint( 'ybo-purchase-list-page', EP_ROOT | EP_PAGES );
    }

    /**
     * AJAX handler ("ybo_add_purchase_list_to_cart"): Add purchase list's products to cart
     *
     * @return void
     */
    public function add_purchase_list_to_cart() {
        $raw  = file_get_contents( 'php://input' );
        $data = json_decode( wp_unslash( $raw ), true );

        if ( ! isset( $data['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $data['nonce'] ) ), 'wp_rest' ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid nonce', 'yay-bulk-order' ) ], 403 );
        }

        $purchase_list_products = $data['products'];

        if ( ! isset( $purchase_list_products ) || ! is_array( $purchase_list_products ) ) {
            $list_id = isset( $data['listId'] ) ? absint( $data['listId'] ) : 0;
            if ( ! $list_id ) {
                wp_send_json_error( [ 'message' => __( 'Missing purchase list', 'yay-bulk-order' ) ], 400 );
            }

            $user_id       = get_current_user_id();
            $purchase_list = $this->purchase_list_service->get_purchase_list( $list_id, $user_id );
        } else {
            $purchase_list = [
                'products' => $purchase_list_products,
            ];
        }

        if ( empty( $purchase_list['products'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Purchase list not found or empty', 'yay-bulk-order' ) ], 404 );
        }

        if ( is_null( WC()->cart ) ) {
            wc_load_cart();
        }

        $added_count  = 0;
        $failed_count = 0;

        foreach ( $purchase_list['products'] as $product ) {
            $quantity = isset( $product['quantity'] ) ? wc_stock_amount( $product['quantity'] ) : 0;
            if ( $quantity <= 0 ) {
                continue;
            }

            $product_data = wc_get_product( $product['productId'] );
            if ( ! $product_data ) {
                ++$failed_count;
                continue;
            }

            if ( $product_data->is_type( 'variation' ) ) {
                $added = WC()->cart->add_to_cart( $product_data->get_parent_id(), $quantity, $product_data->get_id() );
                $added ? ++$added_count : ++$failed_count;
            } elseif ( $product_data->is_type( 'grouped' ) ) {
                foreach ( $product_data->get_children() as $child_id ) {
                    $added = WC()->cart->add_to_cart( $child_id, $quantity );
                    $added ? ++$added_count : ++$failed_count;
                }
            } else {
                $added = WC()->cart->add_to_cart( $product_data->get_id(), $quantity );
                $added ? ++$added_count : ++$failed_count;
            }
        }//end foreach

        if ( ! $added_count ) {
            wp_send_json_error( [ 'message' => __( 'No items could be added to the cart', 'yay-bulk-order' ) ], 400 );
        }

        wp_send_json_success(
            [
                'cartUrl'     => wc_get_cart_url(),
                'addedCount'  => $added_count,
                'failedCount' => $failed_count,
            ]
        );
    }

    /**
     * AJAX handler ("ybo_save_purchase_list_from_cart"): save as a new purchase list from cart
     *
     * @return void
     */
    public function save_purchase_list_from_cart() {
        $raw  = file_get_contents( 'php://input' );
        $data = json_decode( wp_unslash( $raw ), true );

        if ( ! isset( $data['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $data['nonce'] ) ), 'wp_rest' ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid nonce', 'yay-bulk-order' ) ], 403 );
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please log in to save a purchase list', 'yay-bulk-order' ) ], 401 );
        }

        $list_name = ! empty( $data['list_name'] ) ? sanitize_text_field( wp_unslash( $data['list_name'] ) ) : __( 'New Purchase List', 'yay-bulk-order' );

        if ( is_null( WC()->cart ) ) {
            wc_load_cart();
        }

        $products = [];
        foreach ( WC()->cart->get_cart_contents() as $cart_item ) {
            $tmp        = [
                'productId' => $cart_item['data']->get_id(),
                'quantity'  => $cart_item['quantity'],
            ];
            $products[] = $tmp;
        }

        if ( empty( $products ) ) {
            wp_send_json_error( [ 'message' => __( 'Your cart is empty', 'yay-bulk-order' ) ], 400 );
        }

        $result = $this->purchase_list_service->insert_purchase_list( $user_id, $list_name, $products );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => __( 'Unexpected Error Occured', 'yay-bulk-order' ) ], 400 );
        } else {
            wp_send_json_success( true );
        }
    }

    /**
     * AJAX handler ("ybo_save_purchase_list_from_order"): save as a new purchase list form user's order
     *
     * @return void
     */
    public function save_purchase_list_from_order() {
        $raw  = file_get_contents( 'php://input' );
        $data = json_decode( wp_unslash( $raw ), true );

        if ( ! isset( $data['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $data['nonce'] ) ), 'wp_rest' ) ) {
            wp_send_json_error( [ 'message' => __( 'Invalid nonce', 'yay-bulk-order' ) ], 403 );
        }

        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Please log in to save a purchase list', 'yay-bulk-order' ) ], 401 );
        }

        if ( ! isset( $data['orderId'] ) ) {
            wp_send_json_error( [ 'message' => __( 'Missing Order to save', 'yay-bulk-order' ) ], 401 );
        }

        $list_name = ! empty( $data['list_name'] ) ? sanitize_text_field( wp_unslash( $data['list_name'] ) ) : __( 'New Purchase List', 'yay-bulk-order' );

        $order = wc_get_order( (int) $data['orderId'] );

        if ( empty( $order ) || (int) $order->get_customer_id() !== $user_id ) {
            wp_send_json_error( [ 'message' => __( 'Missing Order to save', 'yay-bulk-order' ) ], 404 );
        }

        $products = [];
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }

            $tmp        = [
                'productId' => $item->get_product_id(),
                'quantity'  => $item->get_quantity(),
            ];
            $products[] = $tmp;
        }

        if ( empty( $products ) ) {
            wp_send_json_error( [ 'message' => __( 'This order has no items', 'yay-bulk-order' ) ], 400 );
        }

        $result = $this->purchase_list_service->insert_purchase_list( $user_id, $list_name, $products );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( [ 'message' => __( 'Unexpected Error Occured', 'yay-bulk-order' ) ], 400 );
        } else {
            wp_send_json_success( true );
        }
    }

    /**
     * Render the "Save as Purchase list" button shown alongside the classic
     * (shortcode-based) cart page, and checkout order review.
     *
     * @return void
     */
    public function save_from_cart_button() {
        ?>
        <div class="ybo_button_container">
            <button class="ybo_save_pl_cart_button wp-element-button checkout"><?php esc_html_e( 'Save as Purchase list', 'yay-bulk-order' ); ?></button>
        </div>
        <?php
    }

    /**
     * Render the "Save as Purchase list" button shown alongside the classic
     * (shortcode-based) mini-cart.
     *
     * @return void
     */
    public function save_from_minicart_button() {
        ?>
        <div class="ybo_minicart_button_container">
            <button class="ybo_save_pl_cart_button wp-element-button checkout"><?php esc_html_e( 'Save as Purchase list', 'yay-bulk-order' ); ?></button>
        </div>
        <?php
    }

    /**
     * Render the "Save as Purchase list" button on the order details view
     * (order-received/thank-you page and account order view), tagged with
     * the order ID. No output if the order cannot be resolved.
     *
     * @param int|\WC_Order $order Order object or order ID.
     * @return void
     */
    public function save_from_order_button( $order ) {
        $order = $order instanceof \WC_Order ? $order : wc_get_order( $order );

        if ( ! $order ) {
            return;
        }
        ?>
        <div class="ybo_order_button_container">
            <button class="ybo_save_pl_order_button wp-element-button" data-order-id="<?php echo esc_attr( $order->get_id() ); ?>"><?php esc_html_e( 'Save as Purchase list', 'yay-bulk-order' ); ?></button>
        </div>
        <?php
    }

    /**
     * Filter callback for the WooCommerce mini-cart footer block: append the
     * "Save as Purchase list" button markup after the block's own content.
     *
     * @param string $block_content Rendered HTML of the mini-cart footer block.
     * @return string Block content with the purchase list button appended.
     */
    public function add_to_block_component( $block_content ) {
        ob_start()
        ?>
        <div class="ybo_minicart_button_container">
            <button class="ybo_save_pl_cart_button wp-element-button"><?php esc_html_e( 'Save as Purchase list', 'yay-bulk-order' ); ?></button>
        </div>
        <?php
        $custom = ob_get_clean();

        return $block_content . $custom;
    }

    /**
     * Add the "Purchase List" entry to the My Account menu when using a block theme
     *
     * @param array $items My Account menu items, keyed by endpoint slug.
     * @return array Menu items, with the purchase list entry added when applicable.
     */
    public function add_menu_purchase_list( $items ) {

        /**
         * Menu keys in order
         * dashboard: Dashboard
         * orders: Orders
         * downloads: Downloads
         * edit-address: Addresses
         * edit-account: Account details
         * customer-logout: Log out
         */
        $new_items = [];
        foreach ( $items as $key => $val ) {
            if ( $key === 'orders' ) {
                $new_items = array_merge(
                    $new_items,
                    [
                        $key                     => $val,
                        'ybo-purchase-list-page' => __( 'Purchase List', 'yay-bulk-order' ),
                    ]
                );
            } else {
                $new_items = array_merge(
                    $new_items,
                    [
                        $key => $val,
                    ]
                );
            }
        }

        return $new_items;
    }


    /**
     * Render the Purchase List Block in the My Account menu (Purchase List)
     *
     * @return void
     */
    public function render_menu_purchase_list() {
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo do_blocks( '<!-- wp:yay-bulk-order/purchase-list /-->' );
    }
}
