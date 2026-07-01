import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { tableRowBefore } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: tableRowBefore,
  edit: Edit,
  save: Save,
});
