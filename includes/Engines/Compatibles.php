<?php
namespace YayBulkOrder\Engines;

use YayBulkOrder\Engines\Compatibles\YayWholesale\YayWholesale;
use YayBulkOrder\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Compatibles
 */
class Compatibles {
    use SingletonTrait;

    protected function __construct() {
        YayWholesale::get_instance();
    }
}
