<?php
namespace YayBulkOrder\Engines\Blocks\Patterns;

class PatternRenderer {

    public static function render( string $view ): string {
        $path = YAY_BULK_ORDER_PLUGIN_PATH . 'includes/patterns/' . $view . '.php';

        if ( ! file_exists( $path ) ) {
            return '';
        }

        ob_start();
        include $path;
        return ob_get_clean();
    }
}
