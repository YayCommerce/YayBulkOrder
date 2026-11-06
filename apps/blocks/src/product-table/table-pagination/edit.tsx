import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  // Static preview only — the real page count/links are computed server-side
  // in render.php from the live product query, same as core's Query Pagination block.
  return (
    <nav {...blockProps} className={`${blockProps.className ?? ''} ybod-pagination`}>
      <ul className="ybod-pagination__list">
        {/* <li>
          <span className="ybod-pagination__link is-disabled">←</span>
        </li> */}
        <li>
          <span className="ybod-pagination__link is-current">1</span>
        </li>
        <li>
          <span className="ybod-pagination__link">2</span>
        </li>
        <li>
          <span className="ybod-pagination__link">3</span>
        </li>
        <li>
          <span className="ybod-pagination__link">→</span>
        </li>
      </ul>
    </nav>
  );
}
