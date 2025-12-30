<?php
namespace YayBulkOrder\Research;

use YayBulkOrder\Utils\SingletonTrait;

/**
 * Research Initializer
 */
class ResearchInit {
    use SingletonTrait;

    /**
     * The Constructor that load the engine classes
     */
    protected function __construct() {
        \YayBulkOrder\Research\RegisterBlocks::get_instance();
    }
}
