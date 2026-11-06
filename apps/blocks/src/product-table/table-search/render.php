<?php
/**
 * Table search input. Rendered on the server so the placeholder and labels
 * follow the site language — save.tsx stores them in English, and that saved
 * markup is ignored here.
 *
 * @var array    $attributes The block attributes.
 * @var string   $content    The block default content.
 * @var WP_Block $block      The block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'ybod-search' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<input
		type="search"
		class="ybod-search__input"
		placeholder="<?php esc_attr_e( 'Search products...', 'yay-bulk-order' ); ?>"
		aria-label="<?php esc_attr_e( 'Search products', 'yay-bulk-order' ); ?>"
		data-wp-bind--value="context.tableState.filter.search"
		data-wp-on--input="actions.updateSearchKeyword"
		data-wp-on--keydown="actions.handleSearchKeydown"
	/>

	<span class="ybod-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"></circle>
			<path d="M16 16L12.6 12.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
		</svg>
	</span>

	<button
		type="button"
		class="ybod-search__clear"
		aria-label="<?php esc_attr_e( 'Clear search', 'yay-bulk-order' ); ?>"
		data-wp-bind--hidden="!state.hasSearchKeyword"
		data-wp-on--click="actions.clearSearch"
	>
		<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	</button>
</div>
