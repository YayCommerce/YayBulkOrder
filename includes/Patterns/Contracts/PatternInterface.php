<?php
namespace YayBulkOrder\Patterns\Contracts;

defined( 'ABSPATH' ) || exit;

interface PatternInterface {

    public function get_key(): string;

    public function get_template(): string;

    public function get_data(): array;
}
