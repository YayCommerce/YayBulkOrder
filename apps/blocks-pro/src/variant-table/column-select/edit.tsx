import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps({ className: 'ybod-table-cell' });

  return (
    <div {...blockProps}>
      <input type="checkbox" aria-label={__('Select variation', 'yay-bulk-order')} />
    </div>
  );
}
