<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static ShortcodesService get_instance()
 */
class ShortcodesService {

    use SingletonTrait;
    
    const SHORTCODE_POST_TYPE = 'yay_bulk_order_shortcode';

    public function get_paginated_shortcode( $keyword, $page, $per_page ) {
        $args = [
            'post_type'              => self::SHORTCODE_POST_TYPE,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                'relation'      => 'AND',
            ],
            'orderby'                => [
                'date'          => 'DESC',
            ],
        ];

        if ( ! isset( $page ) || ! isset( $per_page ) ) {
            $args['posts_per_page'] = '-1';
        } else {
            $args['posts_per_page'] = $per_page;
            $args['paged']          = $page;
        }

        if ( isset( $keyword ) ) {
            $args['meta_query'][] = [
                'relation' => 'OR',
                [
                    'key'     => 'title',
                    'value'   => $keyword,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
               
            ];
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
   
    private function clean_shortcode_data( $data ) {
        return [
            'id'    => $data->ID,
            'title' => $data->post_title,
            'shortcode' => ['[yay_bulk_order_shortcode id="' . $data->ID . '"]'],
        ];
    }
   
}
