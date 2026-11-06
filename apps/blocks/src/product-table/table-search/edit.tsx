import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybod-search`}>
      <input
        type="search"
        className="ybod-search__input"
        placeholder={__('Search products...', 'yay-bulk-order')}
        readOnly
      />
      <span className="ybod-search__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16L12.6 12.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
