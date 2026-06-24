import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { cart } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';

import './style.scss';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: cart,
  edit: Edit,
});
