import { useBlockProps } from '@wordpress/block-editor';

import { useIsProductTaxonomyArchiveTemplate } from '../table-root/useProductArchiveTemplate';

export default function Edit() {
  const blockProps = useBlockProps();
  const isTaxonomyArchive = useIsProductTaxonomyArchiveTemplate();

  if (isTaxonomyArchive) {
    return null;
  }

  // Static preview only — the real category list is fetched server-side in
  // render.php (get_terms('product_cat')), same reasoning as table-pagination.
  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybo-filter-sidebar`}>
      <p className="ybo-filter-sidebar__title">Categories</p>
      <hr className="ybo-filter-sidebar__divider" />
      <div className="ybo-filter-sidebar__list">
        <span className="ybo-filter-sidebar__link is-active">All Products</span>
        <span className="ybo-filter-sidebar__link">Category A</span>
        <span className="ybo-filter-sidebar__link">Category B</span>
      </div>
    </div>
  );
}
