import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
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

/**
 * Query arg set by `archiveProductTemplateUrl()` (apps/app-admin/src/lib/helpers/wp.helper.ts)
 * when linking here from the Publish step. Must match `CATALOG_TEMPLATE_NOTICE_PARAM` there.
 */
const CATALOG_TEMPLATE_NOTICE_PARAM = 'ybod-catalog-notice';

/** Minimal shape of the `core/notices` store's dispatch actions we use. */
type NoticesDispatch = {
  createNotice: (
    status: 'info' | 'success' | 'warning' | 'error',
    content: string,
    options?: Record<string, unknown>,
  ) => void;
};

function maybeShowCatalogTemplateNotice() {
  const url = new URL(window.location.href);
  if (url.searchParams.get(CATALOG_TEMPLATE_NOTICE_PARAM) !== '1') {
    return;
  }

  url.searchParams.delete(CATALOG_TEMPLATE_NOTICE_PARAM);
  window.history.replaceState({}, '', url.toString());

  // `core/notices` is already registered by the Site Editor's own scripts,
  // so this dispatches into it without needing @wordpress/notices as a dependency.
  (dispatch('core/notices') as unknown as NoticesDispatch).createNotice(
    'info',
    'Yay Bulk Order: ' +
      __(
        'Now you\'re in the catalog template. Add the product table here using a Pattern, a copied block, a copied shortcode, or by inserting the "Product Table" block manually.',
        'yay-bulk-order',
      ),
    { isDismissible: true },
  );
}

maybeShowCatalogTemplateNotice();

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
