<?php
namespace YayBulkOrder\Pro\Services;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Resolves which product a Variant Table block renders.
 *
 * - On a Single Product template/page, the block auto-detects the product
 *   being viewed via the `postId` block context WordPress/WooCommerce
 *   provide there.
 * - Anywhere else, it falls back to the product explicitly picked in the
 *   editor (`productId` attribute), forwarded to descendant blocks via the
 *   `yay-bulk-order/variantProductId` context key (see block.json's
 *   `providesContext`).
 *
 * @method static VariantTableService get_instance()
 */
class VariantTableService {
    use SingletonTrait;

    public const CONTEXT_PRODUCT_ID_KEY = 'yay-bulk-order/variantProductId';

    public function resolve_product_id( array $context ): int {
        // An explicit editor pick always wins. The editor only ever lets you
        // make one on a page that isn't a genuine Single Product view — its
        // picker's own copy says as much ("this picker only shows up
        // elsewhere") — so on the one page type where it's never set, this
        // is a no-op and falls straight through to the context/query below.
        $picked_id = isset( $context[ self::CONTEXT_PRODUCT_ID_KEY ] ) ? absint( $context[ self::CONTEXT_PRODUCT_ID_KEY ] ) : 0;
        if ( $picked_id ) {
            return $picked_id;
        }

        // Only trust ambient `postId` context on an actual single-product
        // page view. A nested block that also provides `postId` context —
        // e.g. the product grid's Query Loop on an *archive* page — hands
        // its current grid item's id down the same way, which is a real
        // product id but not "this page's product"; picking it up there
        // would silently swap in whatever product the loop happens to be
        // rendering instead of the one actually chosen for this block.
        if ( function_exists( 'is_product' ) && is_product() ) {
            $context_post_id = isset( $context['postId'] ) ? absint( $context['postId'] ) : 0;
            if ( $context_post_id && 'product' === get_post_type( $context_post_id ) ) {
                return $context_post_id;
            }

            // Classic (non-block) single product templates don't provide
            // `postId` context at all; fall back to the queried product.
            return get_the_ID();
        }

        return 0;
    }

    public function resolve_product( array $context ): ?\WC_Product {
        $product_id = $this->resolve_product_id( $context );
        if ( ! $product_id ) {
            return null;
        }

        $product = wc_get_product( $product_id );

        return $product instanceof \WC_Product ? $product : null;
    }
}
