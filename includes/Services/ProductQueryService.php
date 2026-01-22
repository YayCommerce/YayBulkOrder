<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static ProductQueryService get_instance()
 */
class ProductQueryService {
    use SingletonTrait;

    /**
     * @param WP_Block $block The block instance.
     * @return array The query vars.
     */
    public function build_query_vars_from_query_block( $block ) {
        $page_param = $this->get_page_param( $block );

        add_filter(
            'query_loop_block_query_vars',
            [ $this, 'extend_product_table_query_vars' ],
            10,
            2
        );

        $query_vars = build_query_vars_from_query_block( $block, $page_param );

        remove_filter(
            'query_loop_block_query_vars',
            [ $this, 'extend_product_table_query_vars' ],
            10
        );

        return $query_vars;
    }

    /**
     * @param array    $query_vars The query vars.
     * @param WP_Block $block The block instance.
     * @return array The extended query vars.
     */
    public function extend_product_table_query_vars( $query_vars, $block ) {
        $filter_param = $this->get_filter_param( $block );

        if ( 'all' === $filter_param ) {
            return $query_vars;
        }
        if ( 'in-stock' === $filter_param ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_query */
            $query_vars['meta_query'] = [
                [
                    'key'     => '_stock_status',
                    'value'   => [ 'instock' ],
                    'compare' => 'IN',
                ],
            ];

            return $query_vars;
        }
        if ( 'on-sale' === $filter_param ) {
            $query_vars['post__in'] = wc_get_product_ids_on_sale();
            return $query_vars;
        }

        return $query_vars;
    }

    /**
     * Get the page param from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return int The page param.
     */
    public function get_page_param( $block ) {
        $query_id = $block->context['yay-bulk-order/queryId'] ?? 0;
        $page_key = 'query-' . $query_id . '-page';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        $page_param = empty( $_GET[ $page_key ] ) ? 1 : (int) $_GET[ $page_key ];
        return $page_param;
    }

    /**
     * Get the filter param from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return 'all' | 'in-stock' | 'on-sale' The filter param.
     */
    public function get_filter_param( $block ) {
        $query_id   = $block->context['yay-bulk-order/queryId'] ?? 0;
        $filter_key = 'query-' . $query_id . '-filter';
        /* phpcs:disable WordPress.Security.NonceVerification.Recommended */
        $filter_param = empty( $_GET[ $filter_key ] ) ? 'all' : sanitize_text_field( wp_unslash( $_GET[ $filter_key ] ) );
        $filter_enums = [ 'all', 'in-stock', 'on-sale' ];
        if ( ! in_array( $filter_param, $filter_enums, true ) ) {
            $filter_param = 'all';
        }
        return $filter_param;
    }
}
