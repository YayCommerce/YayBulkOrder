import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import { BulkOrderFormAttributes } from './type';

import './style.scss';
import './editor.scss';

registerBlockType<BulkOrderFormAttributes>(
  metadata as unknown as BlockConfiguration<BulkOrderFormAttributes>,
  {
    edit: Edit,
    save: Save,
  },
);
