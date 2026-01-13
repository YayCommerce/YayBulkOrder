<?php
namespace YayBulkOrder\Engines\Admin;

use YayBulkOrder\Engines\Register\ScriptName;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Add admin page to the WordPress admin
 *
 * @method static AdminPage get_instance()
 */
class AdminPage {
    use SingletonTrait;

    private $hook_suffix;

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'settings_menu' ], YAY_BULK_ORDER_MENU_PRIORITY );
        add_filter( 'admin_body_class', [ $this, 'admin_body_class' ] );
        add_filter( 'plugin_action_links_' . YAY_BULK_ORDER_PLUGIN_BASENAME, [ $this, 'plugin_action_links' ] );

        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_bulk_order_settings_scripts' ] );
        }
    }

    public function settings_menu() {
        $this->hook_suffix['yay_bulk_order_main_page'] = add_submenu_page(
            'yaycommerce',
            __( 'YayBulkOrder Manager', 'yay-bulk-order' ),
            __( 'YayBulkOrder', 'yay-bulk-order' ),
            'manage_options',
            'yay-bulk-order',
            [ $this, 'settings_page' ],
            0
        );
    }

    public function plugin_action_links( $links ) {
        $action_links = [
            'admin-page' => '<a href="' . admin_url( 'admin.php?page=yay-bulk-order' ) . '" aria-label="' . esc_attr__( 'YayBulkOrder', 'yay-bulk-order' ) . '">' . esc_html__( 'Admin Page', 'yay-bulk-order' ) . '</a>',
        ];
        return array_merge( $action_links, $links );
    }

    public function settings_page() {
        echo '<div id="yay-bulk-order-admin-page" class="yay-ui"></div>';
    }

    public function enqueue_bulk_order_settings_scripts( $screen_id ) {
        if ( 'yaycommerce_page_yay-bulk-order' !== $screen_id ) {
            return;
        }

        wp_enqueue_script( ScriptName::ADMIN_PAGE );
        wp_enqueue_style( ScriptName::STYLE_ADMIN_PAGE );

        wp_localize_script(
            ScriptName::ADMIN_PAGE,
            'yayBulkOrderData',
            [
                'assetsUrl' => YAY_BULK_ORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1/' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ]
        );
    }

    public function admin_body_class( $classes ) {
        if ( strpos( $classes, 'yay-ui' ) === false ) {
            $classes .= ' yay-ui';
        }
        return $classes;
    }
}
