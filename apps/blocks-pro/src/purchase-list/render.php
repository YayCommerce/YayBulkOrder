<?php
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
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<div class="wp-block-yay-bulk-order-purchase-list">
		<div class="ybo_header">
			<h2><?php esc_html_e( 'Purchase lists', 'yay-bulk-order' ); ?></h2>
			<button class="ybo_button ybo_add_button">
				<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
					<path d="M8 3.2H4.8V0H3.2V3.2H0V4.8H3.2V8H4.8V4.8H8V3.2Z" />
				</svg>
				<?php esc_html_e( 'New List', 'yay-bulk-order' ); ?>
			</button>
		</div>
		<div class="ybo_header">
			<div class="ybo_purchase_list_perpage">
				<div><?php esc_html_e( 'Showing: ', 'yay-bulk-order' ); ?></div>
				<select value="5">
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="50">50</option>
				</select>
		</div>
			<input class="ybo_input" type="text" placeholder="<?php esc_html_e( 'Search purchase list...', 'yay-bulk-order' ); ?>" />
		</div>
		<div class="ybo_table_wrapper">
			<table>
				<thead>
					<tr>
						<th><?php esc_html_e( 'List name', 'yay-bulk-order' ); ?></th>
						<th><?php esc_html_e( 'Number of items', 'yay-bulk-order' ); ?></th>
						<th><?php esc_html_e( 'Actions', 'yay-bulk-order' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $sample_data as $list ) : ?>
						<tr>
							<td class="ybo_purchase_list_item_name"><?php echo esc_html( $list['name'] ); ?></td>
							<td>
								<?php
								printf(
									/* translators: %d: number of items in the list */
									esc_html__( '%d items', 'yay-bulk-order' ),
									(int) count($list['products'])
								);
								?>
							</td>
							<td class="ybo_purchase_list_item_actions">
								<button class="ybo_button">
									<span><?php esc_html_e( 'View', 'yay-bulk-order' ); ?></span>
								</button>
								<button class="ybo_button">
									<span><?php esc_html_e( 'Download', 'yay-bulk-order' ); ?></span>
								</button>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	</div>
</div>
