<?php
/**
 * @var array $attributes The block attributes.
 * @var string $content The block default content.
 * @var WP_Block $block The block instance.
 */
use YayBulkOrder\Services\LocalizeService;

$localize_service = LocalizeService::get_instance();

$global_config = $localize_service->get_global_config();
$default_cart_quantity = $global_config['settings']['general']['defaultCartQuantity'];

?>

<td
    <?php echo get_block_wrapper_attributes(); ?>
>
    <input
        type="number"
        min="1"
        step="<?php echo esc_attr($default_cart_quantity); ?>"
        default-value="<?php echo esc_attr($default_cart_quantity); ?>"
    />
</td>