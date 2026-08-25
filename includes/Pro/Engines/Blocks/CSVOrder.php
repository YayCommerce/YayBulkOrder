<?php
namespace YayBulkOrder\Pro\Engines\Blocks;

use YayBulkOrder\Pro\Services\CSVOrderService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Purchase List Blocks
 */
class CSVOrder {
    use SingletonTrait;

    private CSVOrderService $csv_order_service;

    private string $shortcode_name = 'ybo_csv_order';

    protected function __construct() {
        $this->csv_order_service = CSVOrderService::get_instance();
        add_action( 'init', [ $this, 'add_csv_order_shortcode' ] );
        add_action( 'template_redirect', [ $this, 'handle_add_to_cart' ] );
    }

    public function add_csv_order_shortcode() {
        if ( ! shortcode_exists( $this->shortcode_name ) ) {
            add_shortcode( $this->shortcode_name, [ $this, 'render_csv_order_shortcode' ] );
        }
    }

    public function render_csv_order_shortcode( array $attr = [] ) {
        return do_blocks( '<!-- wp:yay-bulk-order/quick-csv-order /-->' );
    }

    public function handle_add_to_cart() {
        if ( empty( $_SERVER['REQUEST_METHOD'] ) || $_SERVER['REQUEST_METHOD'] !== 'POST' ) {
            return;
        }

        if ( ! isset( $_POST['ybo_csv_order_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['ybo_csv_order_nonce'] ) ), 'ybo_csv_order_nonce' ) ) {
            return;
        }

        if ( ! isset( $_FILES ) || ! isset( $_FILES[ $this->shortcode_name ] ) || ! isset( $_FILES[ $this->shortcode_name ]['tmp_name'] ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $full_filename = $_FILES[ $this->shortcode_name ]['tmp_name'];
        $logs          = $this->csv_order_service->quick_csv_add_to_cart( $full_filename );

        set_transient( CSVOrderService::CSV_ORDER_RECENT_LOG, $logs, 10 * 60 );
    }
}
