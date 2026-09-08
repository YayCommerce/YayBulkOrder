<?php

use YayBulkOrder\Pro\Services\CSVOrderService;

/**
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 */

defined('ABSPATH') || exit;

$recent_logs = get_transient(CSVOrderService::CSV_ORDER_RECENT_LOG);
if ($recent_logs) {
	delete_transient(CSVOrderService::CSV_ORDER_RECENT_LOG);
}

$nonce = wp_create_nonce('ybo_csv_order_nonce');

?>
<?php if (! is_user_logged_in()) : ?>
	<span>
		<?php esc_html_e('You currently not logged in. To make a quick order, please log in first. ', 'yay-bulk-order'); ?>
		<a href="<?php echo (esc_url(wc_get_page_permalink('myaccount'))); ?>"><?php esc_html_e('Click here to login', 'yay-bulk-order'); ?></a>
	</span>
<?php else : ?>
	<div class="wp-block-yay-bulk-order-quick-csv-order">

		<form method="post" enctype="multipart/form-data">
			<input type="hidden" name="ybo_csv_order_nonce" value="<?php echo (esc_attr($nonce)); ?>" />
			<div class="ybo_csv_order_header">
				<span><?php esc_attr_e('Quick Order via CSV Upload', 'yay-bulk-order'); ?></span>
			</div>
			<label htmlFor="ybo_csv_order" class="ybo_csv_order_drop_zone">
				<div class="ybo_csv_order_zone_placeholder">
					<svg width="16" height="16" fill="currentColor" aria-hidden="true">
						<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/upload.svg')); ?>">#plus_icon</use>
					</svg>
					<span>
						<?php
						esc_html_e('Drop csv file here, or click to upload', 'yay-bulk-order')
						?>
					</span>
				</div>
				<div class="ybo_csv_order_zone_file">
					<div>
						<span class="ybo_csv_order_file_name"></span>
						<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="ybo_csv_order_file_remove">
							<use href="<?php echo (esc_url(YAYBULKORDER_PLUGIN_URL . 'assets/images/icon/x.svg')); ?>">#x_icon</use>
						</svg>
					</div>
				</div>

				<input
					class="ybo_csv_order_file_input"
					type="file"
					id="ybo_csv_order"
					name="ybo_csv_order"
					accept=".csv" />
			</label>
			<span class="ybo_csv_order_help_text"><?php esc_html_e('Upload .csv files with SKU on first column and quantity on second column.', 'yay-bulk-order'); ?></span>
			<span class="ybo_csv_order_file_error">Error</span>
			<div class="ybo_csv_order_actions">
				<button class="wp-element-button" type="submit">
					<?php esc_html_e('Add to Cart', 'yay-bulk-order'); ?>
				</button>
			</div>
		</form>
		<?php if ($recent_logs) : ?>
			<div class="ybo_csv_order_logs">
				<p><?php esc_attr_e('Results', 'yay-bulk-order'); ?></p>
				<p>
					<?php
					echo (esc_html(
						// translators: %d: the success rows added to cart
						sprintf(__('Added %d product(s) to cart.', 'yay-bulk-order'), $recent_logs['success'])
					));
					?>
				</p>
				<?php foreach ($recent_logs['failed'] as $logs) : ?>
					<p><?php echo (esc_html($logs)); ?></p>
				<?php endforeach ?>
			</div>
		<?php endif ?>
	</div>
<?php endif ?>
