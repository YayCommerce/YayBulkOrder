import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybod-search`}>
      <input
        type="search"
        className="ybod-search__input"
        placeholder="Search products..."
        aria-label="Search products"
        data-wp-bind--value="context.tableState.filter.search"
        data-wp-on--input="actions.updateSearchKeyword"
        data-wp-on--keydown="actions.handleSearchKeydown"
      />

      <span className="ybod-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16L12.6 12.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      <button
        type="button"
        className="ybod-search__clear"
        aria-label="Clear search"
        data-wp-bind--hidden="!state.hasSearchKeyword"
        data-wp-on--click="actions.clearSearch"
      >
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
