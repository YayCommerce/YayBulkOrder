import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { queryPagination } from '@wordpress/icons';

import './style.scss';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: queryPagination,
  edit: Edit,
  save: Save,
});
