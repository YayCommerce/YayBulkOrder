<?php
namespace YayBulkOrder\Engines\Blocks;

use Override;
use YayBulkOrder\Services\PurchaseListService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Purchase List Blocks
 */
class PurchaseList {
    use SingletonTrait;

    private PurchaseListService $purchase_list_service;

    protected function __construct() {
        $this->purchase_list_service = PurchaseListService::get_instance();

        // Register new post type
        add_action( 'init', [ $this, 'register_purchase_list_post_type' ] );
    }

    public function register_purchase_list_post_type() {
        $post_type = $this->purchase_list_service::PURCHASE_LIST_POST_TYPE;
        $labels    = [
            'name'          => __( 'Purchase Lists', 'yay-bulk-order' ),
            'singular_name' => __( 'Purchase List', 'yay-bulk-order' ),
        ];
        $args      = [
            'labels'            => $labels,
            'description'       => __( 'Customer purchase lists', 'yay-bulk-order' ),
            'public'            => false,
            'show_ui'           => false,
            'has_archive'       => false,
            'show_in_admin_bar' => false,
            'show_in_rest'      => true,
            'show_in_menu'      => false,
            'query_var'         => false,
            'supports'          => [
                'title',
                'author',
            ],
            'map_meta_cap'      => true,
            'capabilities'      => [
                'edit_post'          => 'read',
                'read_post'          => 'read',
                'delete_post'        => 'read',
                'edit_posts'         => 'read',
                'edit_others_posts'  => 'manage_options',
                'delete_posts'       => 'manage_options',
                'publish_posts'      => 'manage_options',
                'read_private_posts' => 'manage_options',
            ],
        ];

        register_post_type( $post_type, $args );
    }
}
