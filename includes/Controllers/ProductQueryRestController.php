<?php
namespace YayBulkOrder\Controllers;

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Utils\SingletonTrait;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Feeds the Product Table block's editor (category checklist, hand-picked
 * product search) — the front end never calls these, it only reads what
 * the editor already saved into the `productQuery` attribute.
 */
class ProductQueryRestController extends BaseRestController {
    use SingletonTrait;

    private ProductQueryService $product_query_service;

    protected function __construct() {
        $this->product_query_service = ProductQueryService::get_instance();
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/product-categories',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_product_categories' ],
                    'permission_callback' => [ $this, 'can_edit_product_table' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/product-search',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'search_products' ],
                    'permission_callback' => [ $this, 'can_edit_product_table' ],
                    'args'                => [
                        'search'  => [
                            'type'    => 'string',
                            'default' => '',
                        ],
                        'include' => [
                            'type'    => 'array',
                            'items'   => [ 'type' => 'integer' ],
                            'default' => [],
                        ],
                    ],
                ],
            ]
        );
    }

    public function get_product_categories() {
        $terms = $this->product_query_service->get_filterable_categories();

        return array_map(
            function ( $term ) {
                return [
                    'id'    => $term->term_id,
                    'name'  => $term->name,
                    'count' => $term->count,
                ];
            },
            $terms
        );
    }

    public function search_products( WP_REST_Request $request ) {
        $search  = $request->get_param( 'search' );
        $include = $request->get_param( 'include' );

        $query_args = [
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => 20,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'fields'         => 'ids',
            'no_found_rows'  => true,
        ];

        // `include` hydrates the token field with the names of already
        // selected products; it takes priority over a live search.
        if ( ! empty( $include ) ) {
            $query_args['post__in']       = array_map( 'absint', $include );
            $query_args['posts_per_page'] = count( $include );
            $query_args['orderby']        = 'post__in';
        } else {
            $query_args['s'] = $search;
        }

        $query = new \WP_Query( $query_args );

        return array_map(
            function ( $product_id ) {
                return [
                    'id'   => $product_id,
                    'name' => get_the_title( $product_id ),
                ];
            },
            $query->posts
        );
    }

    public function can_edit_product_table() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
