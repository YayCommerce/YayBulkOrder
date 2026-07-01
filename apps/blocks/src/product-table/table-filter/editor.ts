import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { filter } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: filter,
  edit: Edit,
  save: Save,
});
