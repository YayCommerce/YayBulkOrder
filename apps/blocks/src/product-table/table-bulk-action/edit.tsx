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
          <span className="ybo-icon-cart" aria-hidden="true">
            <svg width="1.05em" height="1.1em" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.4189 20.9995H7.57253C4.69037 20.9995 2.47928 19.9624 3.10734 15.7881L3.83863 10.131C4.22578 8.04812 5.55932 7.25098 6.72939 7.25098H16.2964C17.4837 7.25098 18.7398 8.10812 19.1872 10.131L19.9185 15.7881C20.4519 19.4909 18.301 20.9995 15.4189 20.9995Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.5476 7.04574C15.5476 4.81136 13.7295 3.00004 11.4867 3.00004C10.4067 2.99548 9.36944 3.41971 8.60416 4.17892C7.83888 4.93813 7.40868 5.96978 7.40869 7.04574H7.40869"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M15.1016 11.5496H15.0568" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.94337 11.5496H7.89863" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>{' '}
          Add selected items to cart
        </button>
      </div>
    </div>
  );
}
