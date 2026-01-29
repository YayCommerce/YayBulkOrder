<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Shortcodes Service
 */
class ShortcodesService {

    use SingletonTrait;

    public const SHORTCODE_PER_PAGE  = 10;
    public const SHORTCODE_POST_TYPE = 'ybo-form-shortcode';

    public function get_paginated_shortcode( $keyword, $page, $per_page ) {
        $args = [
            'post_type'              => self::SHORTCODE_POST_TYPE,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                'relation' => 'AND',
            ],
            'orderby'                => [
                'date' => 'DESC',
            ],
        ];

        if ( ! isset( $page ) || ! isset( $per_page ) ) {
            $args['posts_per_page'] = '-1';
        } else {
            $args['posts_per_page'] = $per_page;
            $args['paged']          = $page;
        }

        if ( ! empty( $keyword ) ) {
            $args['s'] = $keyword;
        }

        $query       = new \WP_Query( $args );
        $data_list   = $query->posts;
        $total_pages = $query->max_num_pages;

        $cleaned = [];
        foreach ( $data_list as $data ) {
            array_push( $cleaned, self::clean_shortcode_data( $data ) );
        }

        $response = [
            'currentPage' => $page,
            'totalPage'   => $total_pages,
            'data'        => $cleaned,
        ];
        return $response;
    }

    private function get_default_columns() {
        return [
            'yay-bulk-order/column-product-title',
            'yay-bulk-order/column-product-price',
            'yay-bulk-order/column-product-stock',
            'yay-bulk-order/column-add-to-cart',
        ];
    }

    private function clean_shortcode_data( $data ) {
        $pattern = get_post_meta( $data->ID, '_ybo_pattern', true );
        $columns = get_post_meta( $data->ID, '_ybo_column_order', true );

        // Default values
        if ( empty( $pattern ) ) {
            $pattern = 'simple';
        }

        if ( empty( $columns ) || ! is_array( $columns ) ) {
            $columns = self::get_default_columns();
        }

        return [
            'id'      => $data->ID,
            'title'   => $data->post_title,
            'pattern' => $pattern,
            'columns' => $columns,
        ];
    }

    public function create_shortcode( $params ) {
        $post_id = wp_insert_post(
            [
                'post_type'   => self::SHORTCODE_POST_TYPE,
                'post_title'  => $params['title'],
                'post_status' => 'publish',
            ]
        );

        if ( is_wp_error( $post_id ) ) {
            throw new \Exception( $post_id->get_error_message() );
        }

        // Save pattern
        $pattern = isset( $params['pattern'] ) ? sanitize_text_field( $params['pattern'] ) : 'simple';
        update_post_meta( $post_id, '_ybo_pattern', $pattern );

        // Save column order
        $columns = isset( $params['columns'] ) && is_array( $params['columns'] )
            ? array_map( 'sanitize_text_field', $params['columns'] )
            : self::get_default_columns();
        update_post_meta( $post_id, '_ybo_column_order', $columns );

        return $post_id;
    }

    public function get_shortcode( $id ) {
        $post = get_post( $id );
        if ( ! $post ) {
            throw new \Exception( __( 'Shortcode not found!', 'yay-bulk-order' ) );
        }
        return self::clean_shortcode_data( $post );
    }

    public function update_shortcode( $id, $params ) {
        $post = get_post( $id );
        if ( ! $post ) {
            throw new \Exception( __( 'Shortcode not found!', 'yay-bulk-order' ) );
        }

        $post->post_title = $params['title'];

        $post_id = wp_update_post( $post );

        if ( is_wp_error( $post_id ) ) {
            throw new \Exception( $post_id->get_error_message() );
        }

        // Update pattern
        if ( isset( $params['pattern'] ) ) {
            $pattern = sanitize_text_field( $params['pattern'] );
            update_post_meta( $post_id, '_ybo_pattern', $pattern );
        }

        // Update column order
        if ( isset( $params['columns'] ) && is_array( $params['columns'] ) ) {
            $columns = array_map( 'sanitize_text_field', $params['columns'] );
            update_post_meta( $post_id, '_ybo_column_order', $columns );
        }

        return self::clean_shortcode_data( get_post( $post_id ) );
    }

    public function delete_shortcode( $id ) {
        $shortcode = get_post( $id );

        if ( ! $shortcode || self::SHORTCODE_POST_TYPE !== $shortcode->post_type ) {
            return false;
        }

        return wp_delete_post( $id );
    }
}
