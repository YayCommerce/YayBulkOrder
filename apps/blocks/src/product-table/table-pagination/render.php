<?php
/**
 * Renders page links from the table's live product query — independently
 * re-queried here (ids only) the same way Core's Query Pagination block
 * derives its total from the Query Loop block's query args.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;
use YayBulkOrder\Utils\BlockHelper;

$product_query_service = ProductQueryService::get_instance();
$pagination             = $product_query_service->get_pagination_info( $block );

$query_id     = $block->context['queryId'] ?? 0;
$current_page = $pagination['currentPage'];
$total_pages  = $pagination['totalPages'];

if ( $total_pages <= 1 ) {
    ?>
    <nav <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-pagination' ) ); ?>></nav>
    <?php
    return;
}

$page_range = BlockHelper::get_pagination_range( $current_page, $total_pages );
?>

<nav
    <?php echo get_block_wrapper_attributes( array( 'class' => 'ybo-pagination' ) ); ?>
    aria-label="<?php echo esc_attr__( 'Products pagination', 'yay-bulk-order' ); ?>"
>
    <ul class="ybo-pagination__list">
        <li>
            <?php if ( $current_page > 1 ) : ?>
                <a
                    class="ybo-pagination__link ybo-pagination__link--prev"
                    href="<?php echo esc_url( BlockHelper::build_query_url( $query_id, array( 'page' => $current_page - 1 ) ) ); ?>"
                    aria-label="<?php echo esc_attr__( 'Previous page', 'yay-bulk-order' ); ?>"
                    data-wp-on--click="actions.navigatePagination"
                    data-wp-on--mouseenter="actions.prefetchOnHover"
                >&lsaquo;</a>
            <?php else : ?>
                <span class="ybo-pagination__link ybo-pagination__link--prev is-disabled" aria-hidden="true">&lsaquo;</span>
            <?php endif; ?>
        </li>

        <?php foreach ( $page_range as $page ) : ?>
            <li>
                <?php if ( null === $page ) : ?>
                    <span class="ybo-pagination__ellipsis" aria-hidden="true">&hellip;</span>
                <?php elseif ( $page === $current_page ) : ?>
                    <span class="ybo-pagination__link is-current" aria-current="page"><?php echo (int) $page; ?></span>
                <?php else : ?>
                    <a
                        class="ybo-pagination__link"
                        href="<?php echo esc_url( BlockHelper::build_query_url( $query_id, array( 'page' => $page ) ) ); ?>"
                        aria-label="<?php echo esc_attr( sprintf( /* translators: %d: page number. */ __( 'Page %d', 'yay-bulk-order' ), $page ) ); ?>"
                        data-wp-on--click="actions.navigatePagination"
                        data-wp-on--mouseenter="actions.prefetchOnHover"
                    ><?php echo (int) $page; ?></a>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>

        <li>
            <?php if ( $current_page < $total_pages ) : ?>
                <a
                    class="ybo-pagination__link ybo-pagination__link--next"
                    href="<?php echo esc_url( BlockHelper::build_query_url( $query_id, array( 'page' => $current_page + 1 ) ) ); ?>"
                    aria-label="<?php echo esc_attr__( 'Next page', 'yay-bulk-order' ); ?>"
                    data-wp-on--click="actions.navigatePagination"
                    data-wp-on--mouseenter="actions.prefetchOnHover"
                >&rsaquo;</a>
            <?php else : ?>
                <span class="ybo-pagination__link ybo-pagination__link--next is-disabled" aria-hidden="true">&rsaquo;</span>
            <?php endif; ?>
        </li>
    </ul>
</nav>
