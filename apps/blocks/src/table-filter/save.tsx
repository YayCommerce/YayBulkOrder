import { useBlockProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Save(props: BlockSaveProps<unknown>) {
  const blockProps = useBlockProps.save();

  return (
    <nav {...blockProps}>
      <button>{__('All', 'yay-bulk-order')}</button>
      <button>{__('In Stock', 'yay-bulk-order')}</button>
      <button>{__('On Sale', 'yay-bulk-order')}</button>
    </nav>
  );
}
