import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { pages } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: pages,
  edit: Edit,
  save: Save,
});
