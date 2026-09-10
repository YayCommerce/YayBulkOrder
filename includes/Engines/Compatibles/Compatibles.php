<?php
namespace YayBulkOrder\Engines\Compatibles;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Bootstraps compatibility adapters for third-party pricing plugins.
 *
 * @method static Compatibles get_instance()
 */
class Compatibles {
    use SingletonTrait;

    protected function __construct() {
        YayWholesale::get_instance();
        YayPricing::get_instance();
        RocketLoader::get_instance();
    }
}
