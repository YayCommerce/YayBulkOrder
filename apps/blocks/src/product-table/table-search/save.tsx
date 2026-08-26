import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

  return (
    <div {...blockProps} className={`${blockProps.className ?? ''} ybo-search`}>
      <input
        type="search"
        className="ybo-search__input"
        placeholder="Search products..."
        aria-label="Search products"
        data-wp-bind--value="context.tableState.filter.search"
        data-wp-on--input="actions.updateSearchKeyword"
        data-wp-on--keydown="actions.handleSearchKeydown"
      />

      <span className="ybo-search__icon" data-wp-bind--hidden="state.hasSearchKeyword" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16L12.6 12.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      <button
        type="button"
        className="ybo-search__clear"
        aria-label="Clear search"
        data-wp-bind--hidden="!state.hasSearchKeyword"
        data-wp-on--click="actions.clearSearch"
      >
        &#10005;
      </button>
    </div>
  );
}
