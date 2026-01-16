import './style.scss';

import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { funnel } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: funnel,
  edit: Edit,
  save: Save,
});
