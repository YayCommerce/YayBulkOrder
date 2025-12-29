<?php

defined( 'ABSPATH' ) || exit;

add_action( 'network_admin_notices', 'yay_bulk_order_deactive_notice' );
add_action( 'admin_notices', 'yay_bulk_order_deactive_notice' );

if ( ! function_exists( 'yay_bulk_order_deactive_notice' ) ) {
    function yay_bulk_order_deactive_notice() {
        if ( current_user_can( 'activate_plugins' ) ) {
            ?>
                <div class="notice notice-error is-dismissible">
                <p>
                <strong><?php esc_html_e( 'It looks like you have another YayBulkOrder version installed, please delete it before activating this new version. All current settings and data are still preserved.', 'yay-bulk-order' ); ?>
                <a href="https://docs.yaycommerce.com/yay-bulk-order/how-to-update-yay-bulk-order"><?php esc_html_e( 'Read more details.', 'yay-bulk-order' ); ?></a>
                </strong>
                </p>
                </div>
            <?php
            if ( isset( $_GET['activate'] ) ) {
                unset( $_GET['activate'] );
            }
        }
    }
}