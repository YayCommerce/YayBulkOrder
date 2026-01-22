<?php
namespace YayBulkOrder\Engines\Shortcodes;

use YayBulkOrder\Patterns\PatternLoader;
use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Register [ybo-form-shortcode] shortcode
 */
final class PatternShortcode {

    use SingletonTrait;

    protected function __construct() {
        add_shortcode( 'ybo-form-shortcode', [ $this, 'render_shortcode' ] );
    }

    /**
     * Shortcode callback
     *
     * @param array $atts
     * @return string
     */
    public function render_shortcode( $atts ): string {
        $atts = shortcode_atts(
            [
                'pattern' => 'simple',
            ],
            $atts,
            'ybo-form-shortcode'
        );

        $loader = new PatternLoader();

        ob_start();
        $loader->render( $atts['pattern'] );
        return ob_get_clean();
    }
}
