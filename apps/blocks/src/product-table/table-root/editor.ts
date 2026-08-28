import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { table } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

import './style.scss';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: table,
  edit: Edit,
  save: Save,
});

addFilter(
  'blockEditor.__unstableCanInsertBlockType',
  'yay-bulk-order/disallow-nested-product-table',
  (canInsert, blockType, rootClientId, { getBlock, getBlockParentsByBlockName }) => {
    if (!canInsert || blockType.name !== metadata.name || !rootClientId) {
      return canInsert;
    }

    const isInsideProductTable =
      getBlock(rootClientId)?.name === metadata.name ||
      getBlockParentsByBlockName(rootClientId, metadata.name).length > 0;

    return !isInsideProductTable;
  },
);
