import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { pages } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: pages,
  edit: Edit,
});
