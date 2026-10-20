import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { list } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: list,
  edit: Edit,
  save: Save,
});
