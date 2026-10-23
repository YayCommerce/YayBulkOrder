<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<td
    <?php
    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    echo get_block_wrapper_attributes();
    ?>
    data-wp-text="state.subtotalFormatted"
>
</td>
