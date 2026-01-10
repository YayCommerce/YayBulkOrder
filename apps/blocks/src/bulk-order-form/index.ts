import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import { FormAttributes } from './type';

registerBlockType(metadata as unknown as BlockConfiguration<FormAttributes>, {
  icon: 'cart',
  edit,
  save,
});
