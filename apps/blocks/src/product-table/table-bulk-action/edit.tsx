import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybo-bulk-action-wrap`}>
      <div className="ybo-bulk-action">
        <a href="#top" className="ybo-bulk-action__back-to-top" onClick={(e) => e.preventDefault()}>
          Go Back to Top ↑
        </a>
        <button type="button" className="ybo-bulk-action__submit" disabled>
          <span aria-hidden="true">🛒</span> Add selected items to cart
        </button>
      </div>
    </div>
  );
}
