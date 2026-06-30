import { ProductTableAttributes } from '@yay-bulk-order/product-table-store';
import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';

registerBlockType<ProductTableAttributes>(metadata as unknown as BlockConfiguration<ProductTableAttributes>, {
  edit: Edit,
});
