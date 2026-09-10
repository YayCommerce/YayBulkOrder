<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Product Table Service
 */
class ProductTablesService {
    use SingletonTrait;

    public const POST_TYPE                  = 'ybo_product_table';
    public const TABLE_CONFIG_META          = 'ybo_product_table_config';
    public const TABLE_PRODUCT_DISPLAY_META = 'ybo_product_table_products';

    public const QUERY_BY_OPTIONS   = [ 'all-products', 'by-categories', 'featured', 'on-sale', 'hand-picked' ];
    public const RESPONSIVE_OPTIONS = [ 'always-show', 'hide-on-mobile', 'hide-on-tablet' ];

    private const STASHED_NEW_PAGE_CONTENT_TRANSIENT = 'ybo_new_page_blocks_';

    public function get_paginated_product_tables( string $search, int $page, int $per_page, $display_type = 'all-type' ) {
        $args = [
            'post_type'              => self::POST_TYPE,
            'post_status'            => 'any',
            'posts_per_page'         => $per_page,
            'paged'                  => $page,
            'orderby'                => [
                'date' => 'DESC',
            ],
            'update_post_meta_cache' => true,
            'meta_query'             => [],
        ];

        if ( ! empty( $search ) ) {
            $args['s'] = $search;
        }

        if ( 'all-tables' !== $display_type ) {
            $args['meta_query'][] = [
                'key'     => self::TABLE_PRODUCT_DISPLAY_META,
                'value'   => $display_type,
                'compare' => '=',
                'type'    => 'CHAR',
            ];
        }

        $query     = new \WP_Query( $args );
        $data_list = $query->posts;
        $data      = array_map( [ $this, 'get_cleanned_data' ], $data_list );

        return [
            'currentPage' => $page,
            'totalPage'   => $query->max_num_pages,
            'totalItems'  => $query->found_posts,
            'data'        => $data,
        ];
    }

    public function get_product_table_by_id( int $id ) {
        $post = get_post( $id );
        if ( ! $post instanceof \WP_Post || self::POST_TYPE !== $post->post_type ) {
            return null;
        }

        return $this->get_cleanned_data( $post );
    }

    public function create_product_table( array $data ) {
        $title = ! empty( $data['title'] ) ? sanitize_text_field( $data['title'] ) : __( 'Untitled table', 'yay-bulk-order' );

        $id = wp_insert_post(
            [
                'post_type'   => self::POST_TYPE,
                'post_status' => 'publish',
                'post_title'  => $title,
            ]
        );

        if ( ! $id || is_wp_error( $id ) ) {
            return null;
        }

        $display = $this->get_product_display( $data );

        update_post_meta( $id, self::TABLE_CONFIG_META, $this->sanitize_config( $data ) );
        update_post_meta( $id, self::TABLE_PRODUCT_DISPLAY_META, $display );

        return $this->get_product_table_by_id( $id );
    }

    public function update_product_table( int $id, array $data ) {
        if ( isset( $data['title'] ) ) {
            wp_update_post(
                [
                    'ID'         => $id,
                    'post_title' => sanitize_text_field( $data['title'] ),
                ]
            );
        }

        $display = $this->get_product_display( $data );

        update_post_meta( $id, self::TABLE_CONFIG_META, $this->sanitize_config( $data ) );
        update_post_meta( $id, self::TABLE_PRODUCT_DISPLAY_META, $display );

        return $this->get_product_table_by_id( $id );
    }

    public function delete_product_table( int $id ) {
        if ( null === $this->get_product_table_by_id( $id ) ) {
            return false;
        }

        return (bool) wp_delete_post( $id, true );
    }

    public function stash_new_page_blocks( string $content ): void {
        set_transient(
            self::STASHED_NEW_PAGE_CONTENT_TRANSIENT . get_current_user_id(),
            $content,
            5 * MINUTE_IN_SECONDS
        );
    }

    public function pop_new_page_block_content(): string {
        $key     = self::STASHED_NEW_PAGE_CONTENT_TRANSIENT . get_current_user_id();
        $content = get_transient( $key );

        if ( false === $content ) {
            return '';
        }

        delete_transient( $key );

        return (string) $content;
    }

    protected function get_product_display( array $data ) {
        $query_by = $data['query']['queryBy'] ?? 'all-products';
        return in_array( $query_by, self::QUERY_BY_OPTIONS, true ) ? $query_by : 'all-products';
    }

    private function default_config() {
        return [
            'query'    => [
                'queryBy'    => 'all-products',
                'categories' => [],
                'products'   => [],
            ],
            'columns'  => [],
            'features' => [
                'hasFilter'     => false,
                'hasSearch'     => false,
                'hasPagination' => false,
                'pageSize'      => 0,
            ],
        ];
    }

    private function get_cleanned_data( \WP_Post $post ) {
        $config = get_post_meta( $post->ID, self::TABLE_CONFIG_META, true );
        $config = is_array( $config ) ? $config : [];

        return array_merge(
            $this->default_config(),
            $config,
            [
                'id'    => $post->ID,
                'title' => $post->post_title,
            ]
        );
    }

    private function sanitize_config( array $data ) {
        $defaults = $this->default_config();

        $query_by = isset( $data['query']['queryBy'] ) && in_array( $data['query']['queryBy'], self::QUERY_BY_OPTIONS, true )
            ? $data['query']['queryBy']
            : $defaults['query']['queryBy'];

        $categories = isset( $data['query']['categories'] )
            ? array_values( array_filter( array_map( 'absint', (array) $data['query']['categories'] ) ) )
            : [];

        $products = isset( $data['query']['products'] )
            ? array_values( array_filter( array_map( 'absint', (array) $data['query']['products'] ) ) )
            : [];

        $columns = [];
        if ( ! empty( $data['columns'] ) && is_array( $data['columns'] ) ) {
            foreach ( $data['columns'] as $column ) {
                if ( empty( $column['slug'] ) ) {
                    continue;
                }
                $responsive = ! empty( $column['responsive'] ) ? sanitize_key( $column['responsive'] ) : 'always-show';
                $columns[]  = [
                    'slug'       => sanitize_key( $column['slug'] ),
                    'enabled'    => ! empty( $column['enabled'] ),
                    'heading'    => isset( $column['heading'] ) ? sanitize_text_field( $column['heading'] ) : '',
                    'responsive' => in_array( $responsive, self::RESPONSIVE_OPTIONS, true ) ? $responsive : 'always-show',
                ];
            }
        }

        $features = isset( $data['features'] ) && is_array( $data['features'] ) ? $data['features'] : [];

        return [
            'query'    => [
                'queryBy'    => $query_by,
                'categories' => $categories,
                'products'   => $products,
            ],
            'columns'  => $columns,
            'features' => [
                'hasFilter'     => ! empty( $features['hasFilter'] ),
                'hasSearch'     => ! empty( $features['hasSearch'] ),
                'hasPagination' => ! empty( $features['hasPagination'] ),
                'pageSize'      => isset( $features['pageSize'] ) ? max( 0, absint( $features['pageSize'] ) ) : $defaults['features']['pageSize'],
            ],
        ];
    }
}
