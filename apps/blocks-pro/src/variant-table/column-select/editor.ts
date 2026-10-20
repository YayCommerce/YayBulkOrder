import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { check } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: check,
  edit: Edit,
});
