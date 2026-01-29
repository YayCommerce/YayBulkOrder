<?php
namespace YayBulkOrder\Engines\Shortcodes;

use YayBulkOrder\Utils\SingletonTrait;
use YayBulkOrder\Engines\Blocks\Patterns\PatternRenderer;
use YayBulkOrder\Services\ShortcodesService;

class PatternShortcode {
    use SingletonTrait;

    protected function __construct() {
        add_shortcode( 'ybo-form-shortcode', [ $this, 'render_pattern' ] );
    }

    /**
     * Shortcode: [ybo-form-shortcode id="1"] or [ybo-form-shortcode pattern="simple"]
     */
    public function render_pattern( $atts ): string {

        $atts = shortcode_atts(
            [
                'id'      => '',
                'pattern' => 'simple',
            ],
            $atts
        );

        $pattern     = $atts['pattern'];
        $columns = [];

        // If ID is provided, get shortcode data
        if ( ! empty( $atts['id'] ) ) {
            $shortcode_id = intval( $atts['id'] );
            $shortcode_service = ShortcodesService::get_instance();
            
            try {
                $shortcode_data = $shortcode_service->get_shortcode( $shortcode_id );
                $pattern        = $shortcode_data['pattern'] ?? $pattern;
                $columns   = $shortcode_data['columns'] ?? [];
            } catch ( \Exception $e ) {
                return $e->getMessage();
            }
        }

        // Get the pattern content (block markup)
        $pattern_content = PatternRenderer::render( $pattern, $columns );

        // Process the block markup through do_blocks() to render it as HTML
        if ( ! empty( $pattern_content ) && function_exists( 'do_blocks' ) ) {
            return do_blocks( $pattern_content );
        }

        return $pattern_content;
    }
}
