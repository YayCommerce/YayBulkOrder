<?php
namespace YayBulkOrder\Services;

use WP_Block;
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

        $query_vars = apply_filters( 'yaybulkorder_product_query_vars', $query_vars );

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
        $products_per_page = $this->get_products_per_page( $block );

        $query_vars['posts_per_page'] = $products_per_page;

        if ( $products_per_page > 0 ) {
            $page                 = $this->get_page_param( $block );
            $query_vars['offset'] = $products_per_page * max( 0, $page - 1 );
        } else {
            unset( $query_vars['offset'] );
        }

        $query_vars = array_merge( $query_vars, $this->build_filter_restrictions( $block ) );

        // Collections like `top-rated` sort rather than restrict — apply
        // any orderby override the collection asked for.
        $product_query_restriction = $this->get_product_query_restriction( $block );
        foreach ( [ 'orderby', 'meta_key', 'order' ] as $orderby_key ) {
            if ( isset( $product_query_restriction[ $orderby_key ] ) ) {
                $query_vars[ $orderby_key ] = $product_query_restriction[ $orderby_key ];
            }
        }

        return $query_vars;
    }

    /**
     * Builds the tax_query / meta_query / post__in / s restrictions for every
     * active shopper filter (category, tag, price, rating, search, on-sale /
     * in-stock) plus the block's own collection restriction.
     *
     * @param WP_Block $block   The block instance.
     * @param string[] $exclude Facet(s) to leave out — 'category' | 'tag' | 'price' | 'rating'.
     *                          Used to compute each sidebar facet's own options/counts
     *                          against every OTHER active filter, without a facet
     *                          silently filtering out its own options (e.g. picking a
     *                          category shouldn't hide that category from the list).
     * @return array<string,mixed>
     */
    private function build_filter_restrictions( $block, array $exclude = [] ): array {
        $filter_param   = $this->get_filter_param( $block );
        $search_param   = $this->get_search_param( $block );
        $category_param = in_array( 'category', $exclude, true ) ? [] : $this->get_category_param( $block );
        $tags_param     = in_array( 'tag', $exclude, true ) ? [] : $this->get_tags_param( $block );
        $min_price      = in_array( 'price', $exclude, true ) ? null : $this->get_min_price_param( $block );
        $max_price      = in_array( 'price', $exclude, true ) ? null : $this->get_max_price_param( $block );
        $rating_params  = in_array( 'rating', $exclude, true ) ? [] : $this->get_rating_param( $block );

        $query_vars = [];

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
        if ( ! empty( $tags_param ) ) {
            $tax_query_clauses[] = [
                'taxonomy' => 'product_tag',
                'field'    => 'slug',
                'terms'    => $tags_param,
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
        if ( ! empty( $rating_params ) ) {
            // Resolved via one direct SQL lookup (post__in) rather than a
            // meta_query clause: WP_Meta_Query adds a JOIN per clause, and an
            // OR'd multi-rating selection needs up to 2 clauses PER rating
            // (bucket lower/upper bound) — 3 ratings alone means 5 self-joins
            // on wp_postmeta, which explodes into a query that can take
            // minutes (or never finish) even on a modest catalog.
            $post_in_sets[] = $this->get_product_ids_for_ratings( $rating_params );
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

        // Every meta_query-based filter (in-stock, price — see BlockHelper)
        // must merge into ONE set of AND'd clauses here, same as tax_query
        // above: assigning $query_vars['meta_query'] outright for each
        // filter would let the last one silently wipe out the others
        // whenever more than one is active at once. Rating is deliberately
        // NOT here — see get_product_ids_for_ratings().
        $meta_query_clauses = [];
        if ( 'in-stock' === $filter_param ) {
            $meta_query_clauses[] = [
                'key'     => '_stock_status',
                'value'   => [ 'instock' ],
                'compare' => 'IN',
            ];
        }

        if ( null !== $min_price || null !== $max_price ) {
            $price_clause = [
                'key'  => '_price',
                'type' => 'DECIMAL(10,2)',
            ];
            if ( null !== $min_price && null !== $max_price ) {
                $price_clause['value']   = [ $min_price, $max_price ];
                $price_clause['compare'] = 'BETWEEN';
            } elseif ( null !== $min_price ) {
                $price_clause['value']   = $min_price;
                $price_clause['compare'] = '>=';
            } else {
                $price_clause['value']   = $max_price;
                $price_clause['compare'] = '<=';
            }
            $meta_query_clauses[] = $price_clause;
        }

        if ( ! empty( $meta_query_clauses ) ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_query */
            $query_vars['meta_query'] = count( $meta_query_clauses ) > 1
                ? array_merge( [ 'relation' => 'AND' ], $meta_query_clauses )
                : $meta_query_clauses;
        }

        return $query_vars;
    }

    /**
     * Product IDs whose rounded average rating falls into ANY of the given
     * star buckets — one direct query, matching the same ROUND()-based
     * bucket used by get_rating_counts() (e.g. a 4.6 average rounds into the
     * "5 stars" bucket). Used as a `post__in` restriction rather than a
     * meta_query clause: WP_Meta_Query adds a JOIN per clause, and each
     * bucket needs up to 2 (lower/upper bound), so 3 selected ratings would
     * mean 5 self-joins on wp_postmeta — expensive enough to take minutes
     * (or never finish) even on a modest catalog.
     *
     * @param int[] $ratings Star ratings (1-5).
     * @return int[]
     */
    private function get_product_ids_for_ratings( array $ratings ): array {
        if ( empty( $ratings ) ) {
            return [];
        }

        global $wpdb;
        $placeholders = implode( ',', array_fill( 0, count( $ratings ), '%d' ) );

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT pm.post_id
                FROM {$wpdb->postmeta} pm
                INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
                WHERE pm.meta_key = '_wc_average_rating'
                    AND CAST(pm.meta_value AS DECIMAL(10,2)) > 0
                    AND p.post_type = 'product'
                    AND p.post_status = 'publish'
                    AND ROUND(CAST(pm.meta_value AS DECIMAL(10,2))) IN ({$placeholders})",
                $ratings
            )
        );
        // phpcs:enable

        return array_map( 'intval', $ids );
    }

    /**
     * Product IDs matching every active shopper filter except the ones in
     * `$exclude` (plus the block's collection restriction, always applied).
     * Backs each sidebar facet's own recalculated options/counts — mirrors
     * how the WooCommerce shop-page filter widgets narrow each other.
     *
     * @param WP_Block $block   The block instance.
     * @param string[] $exclude Facet(s) to leave out — see build_filter_restrictions().
     * @return int[]
     */
    private function get_matching_product_ids( $block, array $exclude = [] ): array {
        $query_vars = array_merge(
            [
                'post_type'      => 'product',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'no_found_rows'  => true,
                'fields'         => 'ids',
            ],
            $this->build_filter_restrictions( $block, $exclude )
        );

        return ( new \WP_Query( $query_vars ) )->posts;
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

        $products_per_page = $this->get_products_per_page( $block );

        $query_vars = [
            'post_type'           => 'product',
            'post_status'         => 'publish',
            'posts_per_page'      => $products_per_page,
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
        }//end if

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
            $on_sale                = wc_get_product_ids_on_sale();
            $query_vars['post__in'] = ! empty( $on_sale ) ? $on_sale : [ 0 ];
        }
        if ( 'in-stock' === $filter_param ) {
            /* phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_query */
            $meta_query               = isset( $query_vars['meta_query'] ) && is_array( $query_vars['meta_query'] )
                ? $query_vars['meta_query']
                : [];
            $meta_query[]             = [
                'key'     => '_stock_status',
                'value'   => [ 'instock' ],
                'compare' => 'IN',
            ];
            $query_vars['meta_query'] = $meta_query;
        }

        return apply_filters( 'yaybulkorder_product_query_vars', $query_vars );
    }

    /**
     * Whether the Product Table should hide its Filter UI (toggle + sidebar).
     * Product taxonomy archives already scope products to a term, so the
     * category filter is redundant. A "Hand-Picked Products" collection is a
     * fixed list too — there's nothing left to filter.
     *
     * @param WP_Block|null $block The table-filter(-sidebar) block instance, if available.
     */
    public function should_hide_filters( $block = null ): bool {
        if ( $this->is_product_taxonomy_archive() ) {
            return true;
        }

        if ( null !== $block ) {
            $product_query = $block->context['productQuery'] ?? [];
            if ( ( $product_query['queryType'] ?? '' ) === 'hand-picked' ) {
                return true;
            }
        }

        return false;
    }

    private function is_product_taxonomy_archive(): bool {
        return function_exists( 'is_product_taxonomy' ) && is_product_taxonomy();
    }

    private function is_inherit_query( $block ): bool {
        if ( is_shop() || $this->is_product_taxonomy_archive() ) {
            return true;
        }

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
     * When `$block` is given, both the term list and each term's `->count`
     * are scoped to products matching every OTHER active filter (tag, price,
     * rating, search) — mirroring how the WooCommerce shop-page filter
     * widgets recalculate each other whenever one changes. Callers without a
     * specific block instance (admin pickers, localized config) get the
     * unscoped, catalog-wide list.
     *
     * @param WP_Block|null $block The table-filter(-sidebar) block instance, if available.
     * @return WP_Term[] The product categories.
     */
    public function get_filterable_categories( $block = null ) {
        return $this->get_filterable_terms( 'product_cat', $block, [ 'category' ] );
    }

    /**
     * Get the selected product tag slugs from URL. With the queryId from Bulk Order Form.
     *
     * @param WP_Block $block The block instance.
     * @return string[] The selected tag slugs.
     */
    public function get_tags_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_tags_param( $query_id );
    }

    /**
     * Product tags with products, for the table-filter block to list. When
     * `$block` is given, scoped to products matching every OTHER active
     * filter — see get_filterable_categories() for why.
     *
     * @param WP_Block|null $block The table-filter(-sidebar) block instance, if available.
     * @return WP_Term[] The product tags.
     */
    public function get_filterable_tags( $block = null ) {
        return $this->get_filterable_terms( 'product_tag', $block, [ 'tag' ] );
    }

    /**
     * Shared by get_filterable_categories() / get_filterable_tags(): the
     * term list, with each `->count` scoped to products matching every
     * active filter except the ones in `$exclude`.
     *
     * `get_terms( [ 'object_ids' => $ids ] )` only decides WHICH terms come
     * back (any term touching at least one of those IDs) — each returned
     * term's `->count` is still WordPress's own site-wide cached count, not
     * one scoped to `$ids`. So after that existence filter, this recomputes
     * `->count` from the actual term_relationships rows among the matching
     * IDs — otherwise every visible term would keep showing its catalog-wide
     * total instead of "how many match the filters you've already picked."
     *
     * @param string        $taxonomy The taxonomy to list ('product_cat' | 'product_tag').
     * @param WP_Block|null $block    The table-filter(-sidebar) block instance, if available.
     * @param string[]      $exclude  Facet(s) to leave out — see build_filter_restrictions().
     * @return WP_Term[]
     */
    private function get_filterable_terms( string $taxonomy, $block, array $exclude ) {
        $args = [
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
        ];

        if ( null === $block ) {
            $terms = get_terms( $args );
            return is_wp_error( $terms ) ? [] : $terms;
        }

        $matching_ids = $this->get_matching_product_ids( $block, $exclude );
        // get_terms() treats an empty `object_ids` as "no restriction" (i.e.
        // every term) — that's the opposite of what a genuinely empty result
        // set (no product matches the other filters) means here.
        if ( empty( $matching_ids ) ) {
            return [];
        }

        $args['object_ids'] = $matching_ids;
        $terms              = get_terms( $args );
        if ( is_wp_error( $terms ) ) {
            return [];
        }

        global $wpdb;
        $placeholders = implode( ',', array_fill( 0, count( $matching_ids ), '%d' ) );
        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT term_taxonomy_id, COUNT(DISTINCT object_id) AS scoped_count
                FROM {$wpdb->term_relationships}
                WHERE object_id IN ({$placeholders})
                GROUP BY term_taxonomy_id",
                $matching_ids
            )
        );
        // phpcs:enable

        $scoped_counts = [];
        foreach ( $rows as $row ) {
            $scoped_counts[ (int) $row->term_taxonomy_id ] = (int) $row->scoped_count;
        }

        foreach ( $terms as $term ) {
            $term->count = $scoped_counts[ (int) $term->term_taxonomy_id ] ?? 0;
        }

        return $terms;
    }

    /**
     * @param WP_Block $block The block instance.
     * @return float|null The minimum price filter from the URL, if set.
     */
    public function get_min_price_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_min_price_param( $query_id );
    }

    /**
     * @param WP_Block $block The block instance.
     * @return float|null The maximum price filter from the URL, if set.
     */
    public function get_max_price_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_max_price_param( $query_id );
    }

    /**
     * @param WP_Block $block The block instance.
     * @return int[] The selected star ratings (1-5, multi-select) from the URL.
     */
    public function get_rating_param( $block ) {
        $query_id = $block->context['queryId'] ?? 0;
        return BlockHelper::get_rating_param( $query_id );
    }

    /**
     * Actual min/max `_price` across published products, for sizing the
     * price filter's range inputs. When `$block` is given, scoped to
     * products matching every OTHER active filter — see
     * get_filterable_categories() for why.
     *
     * @param WP_Block|null $block The table-filter(-sidebar) block instance, if available.
     * @return array{min: float, max: float}
     */
    public function get_price_bounds( $block = null ): array {
        global $wpdb;

        $scope = $this->build_matching_ids_sql_scope( $block, [ 'price' ] );
        if ( null !== $scope && empty( $scope['ids'] ) ) {
            return [
                'min' => 0.0,
                'max' => 0.0,
            ];
        }

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $sql = "SELECT MIN(CAST(pm.meta_value AS DECIMAL(10,2))) AS min_price, MAX(CAST(pm.meta_value AS DECIMAL(10,2))) AS max_price
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
            WHERE pm.meta_key = '_price'
                AND pm.meta_value != ''
                AND p.post_type = 'product'
                AND p.post_status = 'publish'"
            . ( null !== $scope ? " AND p.ID IN ({$scope['placeholders']})" : '' );

        $bounds = null !== $scope ? $wpdb->get_row( $wpdb->prepare( $sql, $scope['ids'] ) ) : $wpdb->get_row( $sql );
        // phpcs:enable

        return [
            'min' => null !== $bounds && null !== $bounds->min_price ? (float) $bounds->min_price : 0.0,
            'max' => null !== $bounds && null !== $bounds->max_price ? (float) $bounds->max_price : 0.0,
        ];
    }

    /**
     * Number of published products per star rating (1-5), rounded the same
     * way WooCommerce's own rating filter widget buckets `_wc_average_rating`
     * (e.g. 4.6 counts toward "5 stars"). Ratings of 0 (no reviews) are
     * excluded. When `$block` is given, scoped to products matching every
     * OTHER active filter — see get_filterable_categories() for why.
     *
     * @param WP_Block|null $block The table-filter(-sidebar) block instance, if available.
     * @return array<int, int> Counts keyed by star rating 1-5.
     */
    public function get_rating_counts( $block = null ): array {
        global $wpdb;

        $counts = array_fill( 1, 5, 0 );

        $scope = $this->build_matching_ids_sql_scope( $block, [ 'rating' ] );
        if ( null !== $scope && empty( $scope['ids'] ) ) {
            return $counts;
        }

        // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $sql = "SELECT ROUND(CAST(pm.meta_value AS DECIMAL(10,2))) AS rounded_rating, COUNT(*) AS product_count
            FROM {$wpdb->postmeta} pm
            INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
            WHERE pm.meta_key = '_wc_average_rating'
                AND CAST(pm.meta_value AS DECIMAL(10,2)) > 0
                AND p.post_type = 'product'
                AND p.post_status = 'publish'"
            . ( null !== $scope ? " AND p.ID IN ({$scope['placeholders']})" : '' )
            . ' GROUP BY rounded_rating';

        $rows = null !== $scope ? $wpdb->get_results( $wpdb->prepare( $sql, $scope['ids'] ) ) : $wpdb->get_results( $sql );
        // phpcs:enable

        foreach ( $rows as $row ) {
            $stars = (int) min( 5, max( 1, (int) $row->rounded_rating ) );
            $counts[ $stars ] += (int) $row->product_count;
        }

        return $counts;
    }

    /**
     * Shared helper for get_price_bounds() / get_rating_counts(): resolves
     * the matching-product-ID scope (and a ready-to-use placeholder string)
     * once, or null when there's no block to scope to.
     *
     * @param WP_Block|null $block   The table-filter(-sidebar) block instance, if available.
     * @param string[]      $exclude Facet(s) to leave out — see build_filter_restrictions().
     * @return array{ids: int[], placeholders: string}|null
     */
    private function build_matching_ids_sql_scope( $block, array $exclude ): ?array {
        if ( null === $block ) {
            return null;
        }

        $ids = $this->get_matching_product_ids( $block, $exclude );

        return [
            'ids'          => $ids,
            'placeholders' => implode( ',', array_fill( 0, count( $ids ), '%d' ) ),
        ];
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
                'fields'        => 'ids',
                'no_found_rows' => false,
            ]
        );

        return [
            'currentPage' => $this->get_page_param( $block ),
            'totalPages'  => max( 1, (int) $query->max_num_pages ),
            'totalItems'  => (int) $query->found_posts,
        ];
    }

    /**
     * Get the pagination data from context, if not get the default in settings
     *
     * @param WP_Block $block The block instance.
     * @return int
     */
    public function get_products_per_page( $block ) {
        $context = $block->context['productQuery'] ?? [];
        if ( ! isset( $context['hasPagination'] ) ) {
            $settings = $this->settings_service->get_settings();
            return $settings['general']['defaultPageSize'];
        }

        if ( $context['hasPagination'] === true ) {
            if ( array_key_exists( 'pageSize', $context ) ) {
                return $context['pageSize'];
            } else {
                $settings = $this->settings_service->get_settings();
                return $settings['general']['defaultPageSize'];
            }
        }

        return -1;
    }
}
