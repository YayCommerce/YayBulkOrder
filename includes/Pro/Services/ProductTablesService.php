<?php
namespace YayBulkOrder\Pro\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Table Prebuilds Service
 */
class ProductTablesService {
    use SingletonTrait;

    public const POST_TYPE                     = 'ybo_product_table';
    public const PREBUILD_CONFIG_META          = 'ybo_product_table_config';
    public const PREBUILD_PRODUCT_DISPLAY_META = 'ybo_product_table_products';

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

        if ( 'all-type' !== $display_type ) {
            $args['meta_query'][] = [
                'key'     => self::PREBUILD_PRODUCT_DISPLAY_META,
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
        $title = empty( $data['title'] ) ? sanitize_text_field( $data['title'] ) : __( 'Untitled table', 'yay-bulk-order' );

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

        update_post_meta( $id, self::PREBUILD_CONFIG_META, $this->sanitize_config( $data ) );
        update_post_meta( $id, self::PREBUILD_PRODUCT_DISPLAY_META, $display );

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

        update_post_meta( $id, self::PREBUILD_CONFIG_META, $this->sanitize_config( $data ) );
        update_post_meta( $id, self::PREBUILD_PRODUCT_DISPLAY_META, $this->sanitize_config( $display ) );

        return $this->get_product_table_by_id( $id );
    }

    public function delete_product_table( int $id ) {
        if ( null === $this->get_product_table_by_id( $id ) ) {
            return false;
        }

        return (bool) wp_delete_post( $id, true );
    }

    protected function get_product_display( array $data ) {
        $display_options = [ 'all', 'by-cat', 'featured', 'on-sale' ];
        $display         = ! empty( $data['productsDisplay'] ) && in_array( $data['productsDisplay'], $display_options, true )
            ? $data['productsDisplay']
            : 'all';
        return $display;
    }

    private function default_config() {
        return [
            'productsDisplay' => 'all',
            'categoryIds'     => [],
            'columns'         => [],
            'filterable'      => false,
            'searchable'      => false,
            'pagination'      => false,
            'pageSize'        => 10,
        ];
    }

    private function get_cleanned_data( \WP_Post $post ) {
        $config           = get_post_meta( $post->ID, self::PREBUILD_CONFIG_META, true );
        $products_display = get_post_meta( $post->ID, self::PREBUILD_PRODUCT_DISPLAY_META, true );
        $config           = is_array( $config ) ? $config : [];

        return array_merge(
            $this->default_config(),
            $config,
            [
                'id'              => $post->ID,
                'title'           => $post->post_title,
                'productsDisplay' => $products_display,
            ]
        );
    }

    private function sanitize_config( array $data ) {
        $columns = [];
        if ( ! empty( $data['columns'] ) && is_array( $data['columns'] ) ) {
            foreach ( $data['columns'] as $column ) {
                if ( empty( $column['slug'] ) ) {
                    continue;
                }
                $columns[] = [
                    'slug'       => sanitize_key( $column['slug'] ),
                    'active'     => ! empty( $column['active'] ),
                    'heading'    => isset( $column['heading'] ) ? sanitize_text_field( $column['heading'] ) : '',
                    'responsive' => ! empty( $column['responsive'] ) ? sanitize_key( $column['responsive'] ) : 'always-show',
                ];
            }
        }

        return [
            'categoryIds' => isset( $data['categoryIds'] ) ? array_map( 'sanitize_text_field', (array) $data['categoryIds'] ) : [],
            'columns'     => $columns,
            'filterable'  => ! empty( $data['filterable'] ),
            'searchable'  => ! empty( $data['searchable'] ),
            'pagination'  => ! empty( $data['pagination'] ),
            'pageSize'    => isset( $data['pageSize'] ) ? max( 0, absint( $data['pageSize'] ) ) : 0,
        ];
    }
}
