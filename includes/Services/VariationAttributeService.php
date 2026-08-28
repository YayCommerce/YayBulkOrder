<?php
namespace YayBulkOrder\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Resolves "Any"-valued variation attributes to a concrete first value,
 * so a variation row can be added to cart without an attribute picker UI.
 *
 * @method static VariationAttributeService get_instance()
 */
class VariationAttributeService {
    use SingletonTrait;

    public function get_variation_selections( \WC_Product_Variation $variation, \WC_Product_Variable $parent_product ): array {
        $resolved             = [];
        $variation_attributes = $variation->get_variation_attributes();
        // e.g. ['attribute_pa_size' => '', 'attribute_pa_color' => 'red']
        $parent_attributes = $parent_product->get_attributes();
        // keyed by sanitize_title(name), e.g. 'pa_size' / 'size'

        foreach ( $variation_attributes as $prefixed_name => $value ) {
            if ( '' !== $value ) {
                continue;
                // Already specified; nothing to resolve.
            }

            $attribute_name = substr( $prefixed_name, strlen( 'attribute_' ) );
            $attribute      = $parent_attributes[ $attribute_name ] ?? null;

            if ( ! $attribute instanceof \WC_Product_Attribute ) {
                continue;
            }

            $slugs       = $attribute->get_slugs();
            $first_value = $slugs[0] ?? '';

            if ( '' === $first_value ) {
                continue;
                // No defined values; let the original Store API error surface for this attribute.
            }

            $resolved[] = [
                'attribute' => $prefixed_name,
                'value'     => $first_value,
            ];
        }//end foreach

        return $resolved;
    }
}
