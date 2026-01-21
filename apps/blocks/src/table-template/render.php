<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

$context = $block->context;
$queryId = $context['yay-bulk-order/queryId'] ?? 0;
$page_param = get_query_var( 'query' . $queryId . 'page' );
$filter_param = get_query_var( 'query' . $queryId . 'filter' );
$page = $page_param ? intval( $page_param ) : 1;
$filter = $filter_param ? $filter_param : 'all';

$state = wp_interactivity_state('yay-bulk-order/bulk-order-form');
$page_size = $state['pageSize'] ?? 5;

$query = new WP_Query( [
    'post_type' => 'product',
    'posts_per_page' => $page_size,
] );
?>



<table
    <?php echo get_block_wrapper_attributes(); ?>
>
    <thead>
        <tr>
            <th colSpan="999">Todo Table Head</th>
        </tr>
        <tr>
            <th colSpan="999"> <?php echo "Debug: " . json_encode( $context ); ?> </th>
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
            $block_instance = $block->parsed_block;
            $product_id     = get_the_ID();
            /** Disable all block features of the row placeholder */
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
