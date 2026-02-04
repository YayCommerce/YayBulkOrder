<?php
namespace YayBulkOrder\Engines\Shortcodes;

use YayBulkOrder\Services\ShortcodesService;
use YayBulkOrder\Services\PatternService;
use YayBulkOrder\Utils\SingletonTrait;

/**
 * Registers and renders the [ybo-form-shortcode] shortcode.
 */
class FormShortcode {
    use SingletonTrait;

    private $pattern_service;
    private $shortcode_service;

    protected function __construct() {
        $this->pattern_service   = PatternService::get_instance();
        $this->shortcode_service = ShortcodesService::get_instance();

        add_shortcode( 'ybo-form-shortcode', [ $this, 'render_pattern' ] );
    }

    /**
     * Shortcode: [ybo-form-shortcode id="1"] or [ybo-form-shortcode pattern="simple"]
     *
     * @param array|string $atts Shortcode attributes.
     * @return string Rendered pattern HTML.
     */
    public function render_pattern( $atts ): string {

        $atts = shortcode_atts(
            [
                'id'      => '',
                'pattern' => 'simple',
            ],
            $atts
        );

        $pattern = $atts['pattern'];
        $columns = [];

        // If ID is provided, get shortcode data
        if ( ! empty( $atts['id'] ) ) {
            $shortcode_id = intval( $atts['id'] );

            try {
                $shortcode_data = $this->shortcode_service->get_shortcode( $shortcode_id );
                $pattern        = $shortcode_data['pattern'] ?? $pattern;
                $columns        = $shortcode_data['columns'] ?? [];
            } catch ( \Exception $e ) {
                return $e->getMessage();
            }
        }

        // Get the pattern content (block markup)
        $pattern_content = $this->pattern_service->render_shortcode( $pattern, $columns );

        // Process the block markup through do_blocks() to render it as HTML
        if ( ! empty( $pattern_content ) && function_exists( 'do_blocks' ) ) {
            return do_blocks( $pattern_content );
        }

        return $pattern_content;
    }
}
