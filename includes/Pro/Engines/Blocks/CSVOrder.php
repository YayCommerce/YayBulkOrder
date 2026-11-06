<?php
namespace YayBulkOrder\Pro\Engines\Blocks;

use YayBulkOrder\Pro\Services\CSVOrderService;
use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Purchase List Blocks
 */
class CSVOrder {
    use SingletonTrait;

    private CSVOrderService $csv_order_service;
    private SettingsService $settings_service;

    private string $shortcode_name = 'yaybulkorder_csv_order';

    private string $file_field_name = 'ybod_csv_order';

    protected function __construct() {
        $this->csv_order_service = CSVOrderService::get_instance();
        $this->settings_service  = SettingsService::get_instance();

        add_action( 'init', [ $this, 'add_csv_order_shortcode' ] );
        add_action( 'template_redirect', [ $this, 'handle_add_to_cart' ] );

        // Add to My Account
        add_filter( 'woocommerce_account_menu_items', [ $this, 'add_menu_quick_order' ], 11, 1 );
        add_action( 'woocommerce_account_yaybulkorder-quick-order_endpoint', [ $this, 'render_menu_quick_order' ] );
    }

    public function add_csv_order_shortcode() {
        if ( ! shortcode_exists( $this->shortcode_name ) ) {
            add_shortcode( $this->shortcode_name, [ $this, 'render_csv_order_shortcode' ] );
        }

        add_rewrite_endpoint( 'yaybulkorder-quick-order', EP_ROOT | EP_PAGES );
        if ( empty( get_option( 'yaybulkorder_flushed_rewrite' ) ) ) {
            flush_rewrite_rules();
            update_option( 'yaybulkorder_flushed_rewrite', true );
        }
    }

    public function render_csv_order_shortcode( array $attr = [] ) {
        return do_blocks( '<!-- wp:yay-bulk-order/quick-csv-order /-->' );
    }

    public function handle_add_to_cart() {
        if ( empty( $_SERVER['REQUEST_METHOD'] ) || $_SERVER['REQUEST_METHOD'] !== 'POST' ) {
            return;
        }

        if ( ! isset( $_POST['ybod_csv_order_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ybod_csv_order_nonce'] ) ), 'ybod_csv_order_nonce' ) ) {
            return;
        }

        if ( ! isset( $_FILES ) || ! isset( $_FILES[ $this->file_field_name ] ) || ! isset( $_FILES[ $this->file_field_name ]['tmp_name'] ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $full_filename = $_FILES[ $this->file_field_name ]['tmp_name'];
        $logs          = $this->csv_order_service->quick_csv_add_to_cart( $full_filename );

        set_transient( CSVOrderService::CSV_ORDER_RECENT_LOG, $logs, 10 * 60 );
    }

    /**
     * Add the "Purchase List" entry to the My Account menu when using a block theme
     *
     * @param array $items My Account menu items, keyed by endpoint slug.
     * @return array Menu items, with the purchase list entry added when applicable.
     */
    public function add_menu_quick_order( $items ) {
        $settings = $this->settings_service->get_settings();
        if ( ! $settings['csvOrder']['isAddToAccountPage'] ) {
            return $items;
        }

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
                        $key              => $val,
                        'yaybulkorder-quick-order' => __( 'Quick Order', 'yay-bulk-order' ),
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
    public function render_menu_quick_order() {
        $settings = $this->settings_service->get_settings();
        if ( ! $settings['csvOrder']['isAddToAccountPage'] ) {
            return;
        }

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
        echo do_blocks( '<!-- wp:yay-bulk-order/quick-csv-order /-->' );
    }
}
