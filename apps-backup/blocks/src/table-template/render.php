<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

use YayBulkOrder\Services\ProductQueryService;

$product_query_service = ProductQueryService::get_instance();

$query_vars = $product_query_service->build_query_vars_from_query_block( $block );
$page_param = $product_query_service->get_page_param( $block );
$filter_param = $product_query_service->get_filter_param( $block );
$query = new WP_Query( $query_vars );

$debug_context = [
    'context' => $block->context,
];

?>

<table
    <?php echo get_block_wrapper_attributes(); ?>
>
    <thead>
        <tr>
            <th colSpan="999">
                Todo Table Head
                <!-- <pre> <?php echo "Debug: " . json_encode( $debug_context, JSON_PRETTY_PRINT ); ?> </pre> -->
            </th>
        </tr>
    </thead>

    <tbody>
    <?php

    if ( ! $query->have_posts() ) {
        echo '<tr><td colspan="999">No products found</td></tr>';
    }

    if ( $query->have_posts() ) {
        $table_body_content = '';

        while ( $query->have_posts() ) {
            $query->the_post();
            $product_id     = get_the_ID();
            /** Disable all block features of the row placeholder */
            $block_instance = $block->parsed_block;
            $block_instance['blockName'] = 'core/null';

            $available_context = array_merge(
                (array) $block->context,
                array(
                    'yay-bulk-order/productId'   => $product_id,
                )
            );

            $single_row_content = (
                new WP_Block(
                    $block_instance,
                    $available_context
                )
            )->render( array( 'dynamic' => false ) );

            $row_classes = 'yay-bulk-order-table-template-row';
            $table_body_content     .= strtr(
                '<tr class="{classes}">
                    {content}
                </tr>',
                array(
                    '{classes}'       => esc_attr( $row_classes ),
                    '{content}'       => $single_row_content,
                )
            );
        }

        // end row loop
        wp_reset_postdata();
        echo $table_body_content;
    }

    ?>
    </tbody>
</table>
