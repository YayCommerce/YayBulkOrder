import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

  return (
    <nav {...blockProps}>
      <a href="#">{__('All', 'yay-bulk-order')}</a>
      <a href="#">{__('In Stock', 'yay-bulk-order')}</a>
      <a href="#">{__('On Sale', 'yay-bulk-order')}</a>
    </nav>
  );
}
