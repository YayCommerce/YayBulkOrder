import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { queryPagination } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

import './style.scss';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: queryPagination,
  edit: Edit,
  save: Save,
});
