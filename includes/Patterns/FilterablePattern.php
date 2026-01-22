<?php
namespace YayBulkOrder\Patterns;

use YayBulkOrder\Patterns\Contracts\PatternInterface;

defined( 'ABSPATH' ) || exit;

final class FilterablePattern implements PatternInterface {

    public function get_key(): string {
        return 'filterable';
    }

    public function get_template(): string {
        return 'bulk-order/filterable.php';
    }

    public function get_data(): array {
        return [
            'products' => wc_get_products(
                [
                    'status' => 'publish',
                    'limit'  => 5,
                ]
            ),
        ];
    }
}
