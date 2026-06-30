import { ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { cart } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType<ProductTableAttributes>(metadata as unknown as BlockConfiguration<ProductTableAttributes>, {
  icon: cart,
  edit: Edit,
  save: Save,
});
