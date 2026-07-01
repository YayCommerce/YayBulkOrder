import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { tableRowAfter } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: tableRowAfter,
  edit: Edit,
  save: Save,
});
