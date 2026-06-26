import { ProductTableAttributes } from '@yay-bulk-order/store';
import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType<ProductTableAttributes>(metadata as unknown as BlockConfiguration<ProductTableAttributes>, {
  edit: Edit,
  save: Save,
});
