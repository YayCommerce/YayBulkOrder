<?php


use YayBulkOrder\Services\PurchaseListService;

/**
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 */

$sample_data = array(
	array(
		'id'         => 1,
		'name'       => __( 'Weekly Order', 'yay-bulk-order' ),
		"products" => [
			1024 => 10,
			1025 => 4
		]
	),
	array(
		'id'         => 2,
		'name'       => __( 'Monthly Restock', 'yay-bulk-order' ),
		"products" => [
			1024 => 10,
			1025 => 4
		]
	),
	array(
		'id'         => 3,
		'name'       => __( 'Favorite Items', 'yay-bulk-order' ),
		"products" => [
			1024 => 10,
			1025 => 4
		]
	),
);

$purchase_list_service = PurchaseListService::get_instance();
wp_interactivity_config(
	'yay-bulk-order/purchase-list',
	$purchase_list_service->get_config()
);

$data_context = [];
?>
<div
	<?php echo get_block_wrapper_attributes(["class" => "wp-block-yay-bulk-order-purchase-list"]); ?>
	data-wp-interactive="yay-bulk-order/purchase-list"
	data-wp-router-region="yay-bulk-order/purchase_list"
	<?php echo wp_interactivity_data_wp_context( $data_context ); ?>
	>
	<!-- LIST VIEW -->
	<div class="ybo_purchase_list_list_view" data-wp-bind--hidden="!state.isListView">
		<div class="ybo_header">
			<h2><?php esc_html_e('Purchase lists', 'yay-bulk-order'); ?></h2>
			<button class="ybo_button ybo_primary_filled_button" data-wp-on--click="actions.showCreateView">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/plus.svg')); ?>">#plus_icon</use>
				</svg>
				<?php esc_html_e('New List', 'yay-bulk-order'); ?>
			</button>
		</div>
		<div class="ybo_header">
			<div class="ybo_purchase_list_perpage">
				<div><?php esc_html_e('Showing: ', 'yay-bulk-order'); ?></div>
				<select value="5">
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="50">50</option>
				</select>
			</div>
			<input class="ybo_input" type="text" placeholder="<?php esc_html_e('Search purchase list...', 'yay-bulk-order'); ?>" />
		</div>
		<div class="ybo_table_wrapper">
			<table>
				<thead>
					<tr>
						<th><?php esc_html_e('List name', 'yay-bulk-order'); ?></th>
						<th><?php esc_html_e('Number of items', 'yay-bulk-order'); ?></th>
						<th><?php esc_html_e('Actions', 'yay-bulk-order'); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($sample_data as $list) : ?>
						<tr>
							<td class="ybo_purchase_list_item_name"><?php echo esc_html($list['name']); ?></td>
							<td>
								<?php
								printf(
									/* translators: %d: number of items in the list */
									esc_html__('%d items', 'yay-bulk-order'),
									(int) count($list['products'])
								);
								?>
							</td>
							<td class="ybo_purchase_list_item_actions">
								<button class="ybo_button">
									<span><?php esc_html_e('View', 'yay-bulk-order'); ?></span>
								</button>
								<button class="ybo_button">
									<span><?php esc_html_e('Download', 'yay-bulk-order'); ?></span>
								</button>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<div class="ybo_footer">
			<div><?php esc_html_e('Showing 1 to 10 lists ', 'yay-bulk-order'); ?></div>
			<div class="ybo_pagination">
				<button class="ybo_button">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/chevron-left.svg')); ?>">#chevron_left_icon</use>
					</svg>
				</button>
				<button class="ybo_button">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/chevron-right.svg')); ?>">#chevron_right_icon</use>
					</svg>
				</button>
				<input class="ybo_input" type="number" value="1" />
			</div>
		</div>
	</div>

	<!-- CREATE VIEW -->
	<div class="ybo_purchase_list_create_view" data-wp-bind--hidden="!state.isCreateView">
		<div class="ybo_card_header">
			<button class="ybo_button ybo_transparent_button" aria-label="<?php esc_attr_e('Back to purchase lists', 'yay-bulk-order'); ?>" data-wp-on--click="actions.showListView">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
			<h2><?php esc_html_e('Add New Purchase List', 'yay-bulk-order'); ?></h2>
		</div>

		<div class="ybo_card_body">
			<div class="ybo_card_row ybo_card_row_head">
				<div class="ybo_card_col_product">
					<?php esc_html_e('Product', 'yay-bulk-order'); ?>
				</div>
				<div class="ybo_card_col_qty"><?php esc_html_e('Qty', 'yay-bulk-order'); ?></div>
				<div class="ybo_card_col_subtotal"><?php esc_html_e('Subtotal', 'yay-bulk-order'); ?></div>
			</div>

			<?php for ($i = 0; $i < 5; $i++) : ?>
				<div class="ybo_card_row">
					<input class="ybo_input ybo_card_product_search" type="text" placeholder="<?php esc_attr_e('Search for a product...', 'yay-bulk-order'); ?>" />
					<input class="ybo_input ybo_card_qty" type="number" min="0" />
					<div class="ybo_card_col_subtotal"><?php echo wc_price(0); ?></div>
				</div>
			<?php endfor; ?>

			<button class="ybo_button ybo_card_new_line">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/plus.svg')); ?>">#plus_icon</use>
				</svg>
				<?php esc_html_e('New line', 'yay-bulk-order'); ?>
			</button>
		</div>

		<div class="ybo_footer ybo_card_footer">
			<div class="ybo_card_actions">
				<button class="ybo_button ybo_primary_filled_button">
					<svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/cart.svg')); ?>">#cart_icon</use>
					</svg>
					<?php esc_html_e('Add to Cart', 'yay-bulk-order'); ?>
				</button>
				<button class="ybo_button">
					<?php esc_html_e('Save list', 'yay-bulk-order'); ?>
				</button>
			</div>
			<div class="ybo_card_total">
				<?php esc_html_e('Total:', 'yay-bulk-order'); ?> <strong><?php echo wc_price(0); ?></strong>
			</div>
		</div>
	</div>

	<!-- EDIT VIEW -->
	<div class="ybo_purchase_list_edit_view" data-wp-bind--hidden="!state.isEditView">
		<div class="ybo_card_header">
			<button class="ybo_button ybo_transparent_button" aria-label="<?php esc_attr_e('Back to purchase lists', 'yay-bulk-order'); ?>" data-wp-on--click="actions.showListView">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
			<h2><?php esc_html_e('Planned Purchases and Procurement Requirements', 'yay-bulk-order'); ?></h2>
		</div>

		<div class="ybo_card_body">
			<div class="ybo_card_row ybo_card_row_removable ybo_card_row_head">
				<div class="ybo_card_col_product">
					<?php esc_html_e('Product', 'yay-bulk-order'); ?>
				</div>
				<div class="ybo_card_col_qty"><?php esc_html_e('Qty', 'yay-bulk-order'); ?></div>
				<div class="ybo_card_col_subtotal"><?php esc_html_e('Subtotal', 'yay-bulk-order'); ?></div>
				<div></div>
			</div>

			<?php for ($i = 0; $i < 3; $i++) : ?>
				<div class="ybo_card_row ybo_card_row_removable">
					<input class="ybo_input ybo_card_product_search" type="text" placeholder="<?php esc_attr_e('Search for a product...', 'yay-bulk-order'); ?>" />
					<input class="ybo_input ybo_card_qty" type="number" min="0" />
					<div class="ybo_card_col_subtotal"><?php echo wc_price(0); ?></div>
					<button class="ybo_button ybo_card_clear_row" aria-label="<?php esc_attr_e('Remove product', 'yay-bulk-order'); ?>">
						<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/x.svg')); ?>">#x_icon</use>
						</svg>
					</button>
				</div>
			<?php endfor; ?>

			<button class="ybo_button ybo_card_new_line">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/plus.svg')); ?>">#plus_icon</use>
				</svg>
				<?php esc_html_e('New line', 'yay-bulk-order'); ?>
			</button>
		</div>

		<div class="ybo_footer ybo_card_footer">
			<div class="ybo_card_actions">
				<button class="ybo_button ybo_primary_filled_button">
					<svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/cart.svg')); ?>">#cart_icon</use>
					</svg>
					<?php esc_html_e('Add to Cart', 'yay-bulk-order'); ?>
				</button>
				<button class="ybo_button">
					<?php esc_html_e('Save list', 'yay-bulk-order'); ?>
				</button>
				<button class="ybo_button">
					<?php esc_html_e('Delete list', 'yay-bulk-order'); ?>
				</button>
			</div>
			<div class="ybo_card_total">
				<?php esc_html_e('Total:', 'yay-bulk-order'); ?> <strong><?php echo wc_price(0); ?></strong>
			</div>
		</div>
	</div>
</div>
