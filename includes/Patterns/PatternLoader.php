<?php
namespace YayBulkOrder\Patterns;

use YayBulkOrder\Patterns\Contracts\PatternInterface;

defined( 'ABSPATH' ) || exit;

final class PatternLoader {

    /**
     * @var PatternInterface[]
     */
    private array $patterns = [];

    public function __construct() {
        $this->register_patterns();
    }

    private function register_patterns(): void {
        $this->add( new SimplePattern() );
        $this->add( new FilterablePattern() );
    }

    private function add( PatternInterface $pattern ): void {
        $this->patterns[ $pattern->get_key() ] = $pattern;
    }

    public function render( string $key ): void {
        if ( ! isset( $this->patterns[ $key ] ) ) {
            return;
        }

        $pattern  = $this->patterns[ $key ];
        $data     = $pattern->get_data();
        $template = trailingslashit( YAY_BULK_ORDER_PLUGIN_PATH ) . 'includes/views/' . $pattern->get_template();

        if ( ! is_readable( $template ) ) {
            return;
        }

        extract( $data, EXTR_SKIP );
        require $template;
    }
}
