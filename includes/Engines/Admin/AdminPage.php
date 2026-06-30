<?php
namespace YayBulkOrder\Engines\Admin;

use YayBulkOrder\Engines\Register\ScriptName;
use YayBulkOrder\Services\LocalizeService;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Add admin page to the WordPress admin
 *
 * @method static AdminPage get_instance()
 */
class AdminPage {
    use SingletonTrait;

    private LocalizeService $localize_service;

    private function __construct() {
        $this->localize_service = LocalizeService::get_instance();

        add_filter( 'admin_body_class', [ $this, 'admin_body_class' ] );
        add_filter( 'plugin_action_links_' . YAYBULKORDER_PLUGIN_BASENAME, [ $this, 'plugin_action_links' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_page_scripts' ] );
    }

    public function plugin_action_links( array $links ) {
        $action_links = [
            'settings' => '<a href="' . admin_url( 'admin.php?page=yay_bulk_order' ) . '" aria-label="' . esc_attr__( 'YayBulkOrder', 'yay-bulk-order' ) . '">' . esc_html__( 'Settings', 'yay-bulk-order' ) . '</a>',
        ];
        return array_merge( $action_links, $links );
    }

    public function enqueue_admin_page_scripts( string $hook_suffix ) {
        if ( 'yaycommerce_page_yay_bulk_order' !== $hook_suffix ) {
            return;
        }

        // use dummy script to handle localize / dependency in js module
        $dummy_handler = ScriptName::ADMIN_PAGE . '-extra';
        $deps          = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n', 'wp-date' ];
        $admin_data    = $this->localize_service->get_admin_data();
        $meta          = $this->localize_service->get_meta();
        wp_register_script( $dummy_handler, '', $deps, YAYBULKORDER_VERSION, false );
        wp_localize_script( $dummy_handler, LocalizeService::VAR_ADMIN_DATA, $admin_data );
        wp_localize_script( $dummy_handler, LocalizeService::VAR_META, $meta );
        wp_enqueue_script( $dummy_handler );

        // enqueue the js module
        wp_enqueue_script_module( ScriptName::ADMIN_PAGE );
        wp_enqueue_style( ScriptName::STYLE_ADMIN_PAGE );
    }

    public function admin_body_class( string $classes ) {
        if ( strpos( $classes, 'yay-ui' ) === false ) {
            $classes .= ' yay-ui';
        }
        return $classes;
    }
}
