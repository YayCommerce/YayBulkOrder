<?php
namespace YayBulkOrder\Engines\Admin;

use YayBulkOrder\Services\ProductTablesService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Product Table Engine
 */
class ProductTable {
    use SingletonTrait;

    private ProductTablesService $product_tables_service;

    protected function __construct() {
        $this->product_tables_service = ProductTablesService::get_instance();

        add_action( 'init', [ $this, 'register_post_type' ] );
        add_filter( 'default_content', [ $this, 'replace_the_stashed_to_the_content' ], 10, 2 );
    }

    public function replace_the_stashed_to_the_content( string $content, \WP_Post $post ) {
        if ( ! $post instanceof \WP_Post || 'page' !== $post->post_type || 'auto-draft' !== $post->post_status ) {
            return $content;
        }

        $blocks = $this->product_tables_service->pop_new_page_block_content();

        return '' !== $blocks ? $blocks : $content;
    }

    public function register_post_type() {
        $post_type = $this->product_tables_service::POST_TYPE;
        $labels    = [
            'name'          => __( 'Product Table', 'yay-bulk-order' ),
            'singular_name' => __( 'Product Table', 'yay-bulk-order' ),
        ];

        $args = [
            'labels'            => $labels,
            'description'       => __( 'Reusable Product Table configurations', 'yay-bulk-order' ),
            'public'            => false,
            'show_ui'           => false,
            'show_in_menu'      => false,
            'show_in_admin_bar' => false,
            'show_in_nav_menus' => false,
            'has_archive'       => false,
            'rewrite'           => false,
            'query_var'         => false,
            'show_in_rest'      => true,
            'rest_base'         => 'table-prebuilds',
            'supports'          => [ 'title' ],
            'capabilities'      => [
                'edit_post'          => 'manage_woocommerce',
                'read_post'          => 'manage_woocommerce',
                'delete_post'        => 'manage_woocommerce',
                'edit_posts'         => 'manage_woocommerce',
                'edit_others_posts'  => 'manage_woocommerce',
                'delete_posts'       => 'manage_woocommerce',
                'publish_posts'      => 'manage_woocommerce',
                'read_private_posts' => 'manage_woocommerce',
            ],
        ];

        register_post_type( $post_type, $args );
    }
}
