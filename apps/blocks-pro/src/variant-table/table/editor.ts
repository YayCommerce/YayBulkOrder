import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { table } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

import './style.scss';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: table,
  edit: Edit,
  save: Save,
});
