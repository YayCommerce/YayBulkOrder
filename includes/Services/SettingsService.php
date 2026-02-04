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
        return array_replace_recursive( $this->get_default_settings(), $settings );
    }

    public function save_settings( $settings ) {
        $settings = array_replace_recursive( $this->get_default_settings(), $settings );
        return update_option( 'yay_bulk_order_settings', $settings );
    }

    public function get_config() {
        return [
            'metadata' => [
                'isBlockTheme' => wp_is_block_theme(),
            ],
            'path'     => [
                'assetsUrl' => YAY_BULK_ORDER_PLUGIN_URL . 'assets/',
                'restUrl'   => rest_url( 'yay-bulk-order/v1' ),
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'wp_rest' ),
            ],
            'settings' => $this->get_settings(),
        ];
    }

    public function get_styles( $styles_setting ) {
        switch ( $styles_setting['borderRadius'] ) {
            case 'normal':
                $var_border_radius = '6px';
                break;
            case 'large':
                $var_border_radius = '8px';
                break;
            case 'small':
                $var_border_radius = '4px';
                break;
            default:
                $var_border_radius = '6px';
                break;
        }

        return [
            '--ybo-primary-color'              => $styles_setting['colors']['primary'],
            '--ybo-text-normal-color'          => $styles_setting['colors']['textNormal'],
            '--ybo-background-normal-color'    => $styles_setting['colors']['backgroundNormal'],
            '--ybo-text-secondary-color'       => $styles_setting['colors']['textSecondary'],
            '--ybo-background-secondary-color' => $styles_setting['colors']['backgroundSecondary'],
            '--ybo-border-color'               => $styles_setting['colors']['borderColor'],
            '--ybo-border-radius'              => $var_border_radius,

            'color'                            => 'var(--ybo-text-normal-color)',
            'background-color'                 => 'var(--ybo-background-normal-color)',
            'border-color'                     => 'var(--ybo-border-color)',
        ];
    }

    private function get_default_settings() {
        return [
            'general' => [
                'defaultCartQuantity' => 10,
                'pageSize'            => 5,
            ],
            'styles'  => [
                'colors'       => [
                    'primary'             => '#2271b1',
                    'textNormal'          => '#333333',
                    'backgroundNormal'    => '#ffffff',
                    'textSecondary'       => '#7b7c80',
                    'backgroundSecondary' => '#f5f5f5',
                    'borderColor'         => '#7b7c80',
                ],
                'borderRadius' => 'normal',
            ],
        ];
    }
}
