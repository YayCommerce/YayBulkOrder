<?php
namespace YayBulkOrder;

use YayBulkOrder\Utils\SingletonTrait;

/**
 * YayBulkOrder Plugin Initializer
 */
class Initialize {
    use SingletonTrait;

    /**
     * The Constructor that load the engine classes
     */
    protected function __construct() {
        \YayBulkOrder\Engines\I18n::get_instance();

        if ( ! function_exists( 'WC' ) ) {
            add_action( 'admin_notices', [ $this, 'required_woocommerce_notice' ] );
            return;
        }

        \YayBulkOrder\Engines\Blocks\RegisterBlocks::get_instance();
        \YayBulkOrder\Engines\Register\RegisterFacade::get_instance();
        \YayBulkOrder\Engines\Admin\AdminPage::get_instance();
        \YayBulkOrder\Engines\RestAPI::get_instance();

        \YayBulkOrder\Engines\Blocks\Patterns\PatternRegistry::get_instance();
        \YayBulkOrder\Engines\Shortcodes\PatternShortcode::get_instance();
    }

    public function required_woocommerce_notice() {
        ?>
            <div class="error">
                <p>
                <?php
                // translators: %s: search WooCommerce plugin link
                printf( 'Yay Bulk Order ' . esc_html__( 'is enabled but not effective. It requires %1$sWooCommerce%2$s in order to work.', 'yay-bulk-order' ), '<a href="' . esc_url( admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' ) ) . '">', '</a>' );
                ?>
                </p>
            </div>
        <?php
    }
}
