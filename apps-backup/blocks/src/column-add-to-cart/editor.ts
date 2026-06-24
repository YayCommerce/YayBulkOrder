import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { column } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';

import './style.scss';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: column,
  edit: Edit,
});
