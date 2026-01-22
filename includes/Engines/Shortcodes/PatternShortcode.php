<?php
namespace YayBulkOrder\Engines\Shortcodes;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Engines\Blocks\Patterns\PatternRenderer;

class PatternShortcode {
    use SingletonTrait;

    protected function __construct() {
        add_shortcode( 'ybo-form-shortcode', [ $this, 'render_pattern' ] );
    }

    /**
     * Shortcode: [ybo-form-shortcode pattern="simple"]
     */
    public function render_pattern( $atts ): string {

        $atts = shortcode_atts(
            [
                'pattern' => 'simple',
            ],
            $atts
        );

        return PatternRenderer::render( $atts['pattern'] );
    }
}
