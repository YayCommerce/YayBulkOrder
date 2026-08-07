import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <button {...blockProps} type="button" className={`${blockProps.className ?? ''} ybo-filter-toggle`}>
      Filters
      <span className="ybo-filter-toggle__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.5 4H9.5M13 4H14.5M1.5 8H4.5M8 8H14.5M1.5 12H9.5M13 12H14.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="11" cy="4" r="1.6" fill="currentColor" />
          <circle cx="6" cy="8" r="1.6" fill="currentColor" />
          <circle cx="11" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
