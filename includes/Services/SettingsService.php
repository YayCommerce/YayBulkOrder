<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Load and save settings
 *
 * @method static SettingsService get_instance()
 */
class SettingsService {
    use SingletonTrait;

    public function get_settings() {
        $settings = get_option( 'yay_bulk_order_settings', [] );
        return wp_parse_args( $settings, $this->get_default_settings() );
    }

    public function save_settings( $settings ) {
        $settings = wp_parse_args( $settings, $this->get_default_settings() );
        return update_option( 'yay_bulk_order_settings', $settings );
    }

    private function get_default_settings() {
        return [
            'general' => [
                'defaultCartQuantity' => 10,
            ],
            'colors'  => [
                'primary'    => '#2271b1',
                'text'       => '#171717',
                'background' => '#ffffff',
            ],
            'styles'  => [
                'borderRadius' => 'medium',
            ],
        ];
    }
}
