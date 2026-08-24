<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Services\SettingsService;
use YayBulkOrder\Utils\BlockHelper;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static ProductQueryService get_instance()
 */
class ProductQueryService {
    use SingletonTrait;

    private SettingsService $settings_service;

    public function __construct() {
        $this->settings_service = SettingsService::get_instance();
    }

    /**
     * @param WP_Block $block The block instance.
     * @return array The query vars.
     */
    public function build_query_vars_from_query_block( $block ) {
        if ( $this->is_inherit_query( $block ) ) {
            return $this->build_inherited_archive_query_vars( $block );
        }

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
     * Run the product table query. For inherit mode this mirrors the WooCommerce
     * shop / product-archive loop (catalog orderby, visibility, taxonomy).
     *
     * @param WP_Block            $block     The block instance.
     * @param array<string,mixed> $overrides Extra WP_Query args (e.g. fields => ids).
     */
    public function create_products_query( $block, array $overrides = [] ): \WP_Query {
        $is_inherit = $this->is_inherit_query( $block );
        $query_vars = array_merge( $this->build_query_vars_from_query_block( $block ), $overrides );
        $query      = new \WP_Query( $query_vars );

        // get_catalog_ordering_args() attaches posts_clauses filters for
        // price / popularity / rating — remove them after this query runs.
        if ( $is_inherit && function_exists( 'WC' ) && WC()->query ) {
            WC()->query->remove_ordering_args();
        }

        return $query;
    }

    /**
     * @param array    $query_vars The query vars.
     * @param WP_Block $block The block instance.
     * @return array The extended query vars.
     */
    public function extend_product_table_query_vars( $query_vars, $block ) {
        $filter_param   = $this->get_filter_param( $block );
        $search_param   = $this->get_search_param( $block );
        $category_param = $this->get_category_param( $block );
        $settings       = $this->settings_service->get_settings();

        $query_vars['posts_per_page'] = $settings['general']['defaultPageSize'];

        if ( '' !== $search_param ) {
            $query_vars['s'] = $search_param;
        }

        $product_query_restriction = $this->get_product_query_restriction( $block );

        $tax_query_clauses = [];
        if ( ! empty( $category_param ) ) {
            $tax_query_clauses[] = [
                'taxonomy' => 'product_cat',
                'field'    => 'slug',
                'terms'    => $category_param,
            ];
        }
        if ( ! empty( $product_query_restriction['tax_query'] ) ) {
            $tax_query_clauses = array_merge( $tax_query_clauses, $product_query_restriction['tax_query'] );
        }
        if ( ! empty( $tax_query_clauses ) ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_tax_query */
            $query_vars['tax_query'] = count( $tax_query_clauses ) > 1
                ? array_merge( [ 'relation' => 'AND' ], $tax_query_clauses )
                : $tax_query_clauses;
        }

        $post_in_sets = [];
        if ( 'on-sale' === $filter_param ) {
            $post_in_sets[] = wc_get_product_ids_on_sale();
        }
        if ( isset( $product_query_restriction['post__in'] ) ) {
            $post_in_sets[] = $product_query_restriction['post__in'];
        }
        if ( ! empty( $post_in_sets ) ) {
            $query_vars['post__in'] = 1 === count( $post_in_sets )
                ? $post_in_sets[0]
                : array_values( array_intersect( ...$post_in_sets ) );

            // An empty post__in is ignored by WP_Query (i.e. "no restriction"),
            // so an empty intersection must be forced to match nothing instead.
            if ( empty( $query_vars['post__in'] ) ) {
                $query_vars['post__in'] = [ 0 ];
            }
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
        }

        // Collections like `top-rated` sort rather than restrict — apply
        // any orderby override the collection asked for.
        foreach ( [ 'orderby', 'meta_key', 'order' ] as $orderby_key ) {
            if ( isset( $product_query_restriction[ $orderby_key ] ) ) {
                $query_vars[ $orderby_key ] = $product_query_restriction[ $orderby_key ];
            }
        }

        return $query_vars;
    }

    /**
     * Mirror the WooCommerce shop / product-archive main loop:
     * catalog orderby (?orderby= / default setting), visibility tax_query,
     * and the current taxonomy term when on a product archive.
     *
     * @param WP_Block $block The block instance.
     * @return array<string,mixed>
     */
    private function build_inherited_archive_query_vars( $block ): array {
        $settings = $this->settings_service->get_settings();
        $page     = $this->get_page_param( $block );

        $tax_query = [];

        if ( $this->is_product_taxonomy_archive() ) {
            $term = get_queried_object();
            if ( $term instanceof \WP_Term ) {
                $tax_query[] = [
                    'taxonomy' => $term->taxonomy,
                    'field'    => 'term_id',
                    'terms'    => [ (int) $term->term_id ],
                ];
            }
        } else {
            // Shop / catalog: optional category filter from the table URL.
            $category_param = $this->get_category_param( $block );
            if ( ! empty( $category_param ) ) {
                $tax_query[] = [
                    'taxonomy' => 'product_cat',
                    'field'    => 'slug',
                    'terms'    => $category_param,
                ];
            }
        }

        $query_vars = [
            'post_type'           => 'product',
            'post_status'         => 'publish',
            'posts_per_page'      => (int) $settings['general']['defaultPageSize'],
            'paged'               => $page,
            'ignore_sticky_posts' => true,
        ];

        if ( function_exists( 'WC' ) && WC()->query ) {
            // Ensure a clean slate, then attach catalog ordering (and any
            // posts_clauses hooks for price / popularity / rating).
            WC()->query->remove_ordering_args();
            $ordering = WC()->query->get_catalog_ordering_args();

            $query_vars['orderby'] = $ordering['orderby'];
            $query_vars['order']   = $ordering['order'];
            if ( ! empty( $ordering['meta_key'] ) ) {
                $query_vars['meta_key'] = $ordering['meta_key'];
            }

            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_tax_query, WordPress.DB.SlowDBQuery.slow_db_query_meta_query */
            $query_vars['tax_query']  = WC()->query->get_tax_query( $tax_query, true );
            $query_vars['meta_query'] = WC()->query->get_meta_query( [], true );
            $query_vars['wc_query']   = 'product_query';
        } elseif ( ! empty( $tax_query ) ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_tax_query */
            $query_vars['tax_query'] = $tax_query;
            $query_vars['orderby']   = 'date ID';
            $query_vars['order']     = 'DESC';
        } else {
            $query_vars['orderby'] = 'date ID';
            $query_vars['order']   = 'DESC';
        }

        $search_param = $this->get_search_param( $block );
        if ( '' !== $search_param ) {
            $query_vars['s'] = $search_param;
        } elseif ( is_search() ) {
            global $wp_query;
            if ( ! empty( $wp_query->query_vars['s'] ) ) {
                $query_vars['s'] = $wp_query->query_vars['s'];
            }
        }

        $filter_param = $this->get_filter_param( $block );
        if ( 'on-sale' === $filter_param ) {
            $on_sale = wc_get_product_ids_on_sale();
            $query_vars['post__in'] = ! empty( $on_sale ) ? $on_sale : [ 0 ];
        }
        if ( 'in-stock' === $filter_param ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_query */
            $meta_query   = isset( $query_vars['meta_query'] ) && is_array( $query_vars['meta_query'] )
                ? $query_vars['meta_query']
                : [];
            $meta_query[] = [
                'key'     => '_stock_status',
                'value'   => [ 'instock' ],
                'compare' => 'IN',
            ];
            $query_vars['meta_query'] = $meta_query;
        }

        return $query_vars;
    }

    /**
     * Whether the Product Table should hide its Filter UI (toggle + sidebar).
     * Product taxonomy archives already scope products to a term, so the
     * category filter is redundant.
     */
    public function should_hide_filters(): bool {
        return $this->is_product_taxonomy_archive();
    }

    private function is_product_taxonomy_archive(): bool {
        return function_exists( 'is_product_taxonomy' ) && is_product_taxonomy();
    }

    private function is_inherit_query( $block ): bool {
        $product_query = $block->context['productQuery'] ?? [];
        return ( $product_query['queryType'] ?? '' ) === 'inherit';
    }

    private function get_product_query_restriction( $block ) {
        $product_query = $block->context['productQuery'] ?? [ 'queryType' => 'all-products' ];
        $query_type    = $product_query['queryType'] ?? 'all-products';

        switch ( $query_type ) {
            case 'featured':
                return [
                    'tax_query' => [
                        [
                            'taxonomy' => 'product_visibility',
                            'field'    => 'name',
                            'terms'    => 'featured',
                        ],
                    ],
                ];

            case 'on-sale':
                return [ 'post__in' => wc_get_product_ids_on_sale() ];

            case 'top-rated':
                // Mirrors WooCommerce's own [top_rated_products] shortcode:
                // sort by the cached average-rating meta, highest first.
                return [
                    'orderby'  => 'meta_value_num',
                    'meta_key' => '_wc_average_rating',
                    'order'    => 'DESC',
                ];

            case 'hand-picked':
                $product_ids = ! empty( $product_query['productIds'] )
                    ? array_map( 'absint', $product_query['productIds'] )
                    : [ 0 ];
                return [ 'post__in' => $product_ids ];

            case 'by-category':
                if ( empty( $product_query['categoryIds'] ) ) {
                    return [];
                }
                return [
                    'tax_query' => [
                        [
                            'taxonomy' => 'product_cat',
                            'field'    => 'term_id',
                            'terms'    => array_map( 'absint', $product_query['categoryIds'] ),
                        ],
                    ],
                ];

            case 'inherit':
            case 'all-products':
            default:
                return [];
        }//end switch
    }

    /**
     * Get the page param from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return int The page param.
     */
    public function get_page_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_page_param( $query_id );
    }

    /**
     * Get the filter param from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return 'all' | 'in-stock' | 'on-sale' The filter param.
     */
    public function get_filter_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_filter_param( $query_id );
    }

    /**
     * Get the search keyword param from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return string The search keyword param.
     */
    public function get_search_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_search_param( $query_id );
    }

    /**
     * Get the selected product category slugs from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return string[] The selected category slugs.
     */
    public function get_category_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_category_param( $query_id );
    }

    /**
     * Product categories with products, for the table-filter block to list.
     *
     * @return WP_Term[] The product categories.
     */
    public function get_filterable_categories() {
        $terms = get_terms(
            [
                'taxonomy'   => 'product_cat',
                'hide_empty' => true,
            ]
        );

        return is_wp_error( $terms ) ? [] : $terms;
    }

    /**
     * Re-runs the product table's query (ids only) to work out where the
     * current page sits, independently from the row-rendering query in
     * product-table-columns — mirrors how Core's Query Pagination block
     * derives its total from the Query Loop block's query args.
     *
     * @param WP_Block $block The block instance.
     * @return array{currentPage: int, totalPages: int, totalItems: int}
     */
    public function get_pagination_info( $block ) {
        $query = $this->create_products_query(
            $block,
            [
                'fields'         => 'ids',
                'no_found_rows'  => false,
            ]
        );

        return [
            'currentPage' => $this->get_page_param( $block ),
            'totalPages'  => max( 1, (int) $query->max_num_pages ),
            'totalItems'  => (int) $query->found_posts,
        ];
    }
}
