<?php


use YayBulkOrder\Pro\Services\PurchaseListService;

/**
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 */

$purchase_list_service = PurchaseListService::get_instance();
wp_interactivity_config(
	'yay-bulk-order/purchase-list',
	$purchase_list_service->get_config()
);

$user_id = get_current_user_id();
$page = 1;
$all_purchase_list = $purchase_list_service->get_purchase_list_by_user($user_id);
wp_interactivity_state(
	'yay-bulk-order/purchase-list',
	[
		"allPurchaseList" => $all_purchase_list,
	]
);

$data_context = [
	"isEmptyLists" => empty($all_purchase_list),
	"page" => $page,
	"perPage" => $purchase_list_service::PURCHASE_LIST_PER_PAGE,
	"search" => "",
	"isPendingCreateList" => false,
	"isPendingUpdateLists" => false,
	"isPendingDeleteLists" => false,
	"isPendingAddToCart" => false,
	"isPendingDownloadList" => [],
];

?>
<?php if ( !is_user_logged_in() ): ?>
	<span>
		<?php esc_html_e("You currently not logged in. To manage the purchase list, please log in first. ", "yay-bulk-order") ?>
		<a href="<?php echo (esc_url(wc_get_page_permalink( 'myaccount' ) )) ?>"><?php esc_html_e("Click here to login", "yay-bulk-order") ?></a>
	</span>
<?php else : ?>
	<div
		<?php echo get_block_wrapper_attributes(["class" => "wp-block-yay-bulk-order-purchase-list"]); ?>
		data-wp-interactive="yay-bulk-order/purchase-list"
		data-wp-router-region="yay-bulk-order/purchase_list"
		<?php echo wp_interactivity_data_wp_context($data_context); ?>>
		<!-- LIST VIEW -->
		<div class="ybo_purchase_list_list_view" data-wp-bind--hidden="!state.isListView">
			<div class="ybo_header">
				<h2><?php esc_html_e('Purchase lists', 'yay-bulk-order'); ?></h2>
				<div class="ybo_header_actions">
					<input class="ybo_input" type="text" placeholder="<?php esc_html_e('Search purchase list...', 'yay-bulk-order'); ?>" data-wp-bind--value="context.search" data-wp-on--input="actions.inputListSearch" />
					<button class="ybo_button ybo_primary_filled_button" data-wp-on--click="actions.showCreateView" data-wp-bind--disabled="context.isPendingCreateList">
						<svg width="16" height="16" viewBox="0 0 22 24" fill="currentColor" aria-hidden="true">
							<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/plus.svg')); ?>">#plus_icon</use>
						</svg>
						<?php esc_html_e('New List', 'yay-bulk-order'); ?>
					</button>
				</div>
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
						<tr data-wp-bind--hidden="state.isEmptyList">
							<td colspan="3">
								<div class="ybo_purchase_list_empty"><?php esc_html_e('No Purchase List', 'yay-bulk-order'); ?></div>
							</td>
						</tr>
						<template data-wp-each--purchase-list="state.displayPurchaseLists.data" data-wp-each-key="context.purchaseList.id">
							<tr>
								<td class="ybo_purchase_list_item_name" data-wp-text="context.purchaseList.name"></td>
								<td data-wp-text="context.purchaseList.itemsCount"></td>
								<td class="ybo_purchase_list_item_actions">
									<button class="ybo_button" data-wp-bind--data-purchase-list-id="context.purchaseList.id" data-wp-on--click="actions.showEditView">
										<span><?php esc_html_e('View', 'yay-bulk-order'); ?></span>
									</button>
									<button
										class="ybo_button"
										data-wp-bind--data-purchase-list-id="context.purchaseList.id"
										data-wp-on--click="actions.download"
										data-wp-bind--disabled="context.purchaseList.isPendingDownload"
									>
										<span><?php esc_html_e('Download', 'yay-bulk-order'); ?></span>
									</button>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>

			<div class="ybo_footer">
				<div data-wp-text="state.displayPurchaseLists.countText"></div>
				<div class="ybo_pagination">
					<button class="ybo_button" data-wp-on--click="actions.previousPage" data-wp-bind--disabled="state.isPreviousPageDisabled">
						<svg width="16" height="16" viewBox="0 0 22 24" fill="currentColor" aria-hidden="true">
							<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/chevron-left.svg')); ?>">#chevron_left_icon</use>
						</svg>
					</button>
					<input class="ybo_input" type="number" value="1" data-wp-bind--value="context.page" />
					<button class="ybo_button" data-wp-on--click="actions.nextPage" data-wp-bind--disabled="state.isNextPageDisabled">
						<svg width="16" height="16" viewBox="0 0 22 24" fill="currentColor" aria-hidden="true">
							<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/chevron-right.svg')); ?>">#chevron_right_icon</use>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- CREATE / EDIT VIEW -->
		<div class="ybo_purchase_list_create_view" data-wp-bind--hidden="!state.isCreateEditView">
			<div class="ybo_card_header">
				<button class="ybo_button ybo_transparent_button" aria-label="<?php esc_attr_e('Back to purchase lists', 'yay-bulk-order'); ?>" data-wp-on--click="actions.showListView">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<h2><?php esc_html_e('Add New Purchase List', 'yay-bulk-order'); ?></h2>
			</div>

			<div class="ybo_card_body">
				<input class="ybo_input ybo_input_name" type="text" placeholder="<?php esc_attr_e('Purchase List Name', 'yay-bulk-order'); ?>"
					data-wp-bind--value="state.form.name"
					data-wp-on--input="actions.inputListName" />
				<div class="ybo_card_row ybo_card_row_head">
					<div class="ybo_card_col_product">
						<?php esc_html_e('Product', 'yay-bulk-order'); ?>
					</div>
					<div class="ybo_card_col_qty"><?php esc_html_e('Qty', 'yay-bulk-order'); ?></div>
					<div class="ybo_card_col_subtotal"><?php esc_html_e('Subtotal', 'yay-bulk-order'); ?></div>
				</div>

				<template data-wp-each--row="state.form.products" data-wp-each-key="context.row.id">
					<div class="ybo_card_row">
						<div class=" ybo_card_product_search">
							<input class="ybo_input" type="text" placeholder="<?php esc_attr_e('Search for a product...', 'yay-bulk-order'); ?>"
								data-wp-bind--value="context.row.name"
								data-wp-on--focusin="actions.toggleSearch"
								data-wp-on--focusout="actions.toggleSearch"
								data-wp-on--input="actions.searchProducts"
								data-wp-bind--readonly="context.row.isSelected" />

							<button
								class="ybo_button ybo_card_clear_row"
								data-wp-bind--hidden="!context.row.isSelected"
								data-wp-on--click="actions.clearProduct"
								aria-label="<?php esc_attr_e('Remove product', 'yay-bulk-order'); ?>">
								<?php esc_html_e('Clear', 'yay-bulk-order'); ?>
							</button>

							<ul
								class="ybo_products_search_list ybo_products_search_results"
								data-wp-bind--hidden="!context.row.isSearching">
								<template
									data-wp-each--product="state.products"
									data-wp-each-key="context.product.id">
									<li class="ybo_products_search_item"
										data-wp-bind--data-row-id="context.row.id"
										data-wp-on--mousedown="actions.selectProduct">
										<img class="ybo_products_search_item_image" data-wp-bind--src="context.product.image" data-wp-bind--alt="context.product.name" />
										<div class="ybo_products_search_info">
											<span class="ybo_products_search_item_name" data-wp-text="context.product.name"></span>
											<span class="ybo_products_search_item_price" data-wp-text="context.product.priceText"></span>
										</div>
									</li>
								</template>
							</ul>
						</div>
						<input
							class="ybo_input ybo_card_qty"
							type="number"
							min="0"
							data-wp-bind--value="context.row.quantity"
							data-wp-on--input="actions.inputQuantity"
							data-wp-bind--data-row-id="context.row.id" />
						<div
							class="ybo_card_col_subtotal"
							data-wp-text="context.row.subtotal"></div>
					</div>
				</template>

				<button class="ybo_button ybo_card_new_line" data-wp-on--click="actions.addNewProductRow">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/plus.svg')); ?>">#plus_icon</use>
					</svg>
					<?php esc_html_e('New line', 'yay-bulk-order'); ?>
				</button>
			</div>

			<div data-wp-bind--hidden="state.isEditView">
				<div class="ybo_footer ybo_card_footer">
					<div class="ybo_card_actions">
						<button class="ybo_button ybo_primary_filled_button">
							<svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/cart.svg')); ?>">#cart_icon</use>
							</svg>
							<?php esc_html_e('Add to Cart', 'yay-bulk-order'); ?>
						</button>
						<button class="ybo_button" data-wp-on--click="actions.createPurchaseList" data-wp-bind--disabled="context.isPendingCreateList">
							<?php esc_html_e('Save list', 'yay-bulk-order'); ?>
						</button>
					</div>
					<div class="ybo_card_total">
						<?php esc_html_e('Total:', 'yay-bulk-order'); ?> <strong data-wp-text="state.form.total"></strong>
					</div>
				</div>
			</div>

			<div data-wp-bind--hidden="state.isCreateView">
				<div class="ybo_footer ybo_card_footer">
					<div class="ybo_card_actions">
						<button class="ybo_button ybo_primary_filled_button" data-wp-on--click="actions.addToCart" data-wp-bind--disabled="context.isPendingAddToCart">
							<svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/cart.svg')); ?>">#cart_icon</use>
							</svg>
							<?php esc_html_e('Add to Cart', 'yay-bulk-order'); ?>
						</button>
						<button class="ybo_button" data-wp-on--click="actions.updatePurchaseList" data-wp-bind--disabled="context.isPendingUpdateList">
							<?php esc_html_e('Save list', 'yay-bulk-order'); ?>
						</button>
						<button class="ybo_button" data-wp-on--click="actions.deletePurchaseList" data-wp-bind--disabled="context.isPendingDeleteList">
							<?php esc_html_e('Delete list', 'yay-bulk-order'); ?>
						</button>
					</div>
					<div class="ybo_card_total">
						<?php esc_html_e('Total:', 'yay-bulk-order'); ?> <strong data-wp-text="state.form.total"><?php echo wc_price(0); ?></strong>
					</div>
				</div>
			</div>
		</div>
	</div>
<?php endif ?>
