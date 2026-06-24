import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

  return (
    <nav {...blockProps}>
      <span> 1 / 3 {__('Pages', 'yay-bulk-order')} </span>
      <a href="#">{__('Previous', 'yay-bulk-order')}</a>
      <a href="#">{__('Next', 'yay-bulk-order')}</a>
    </nav>
  );
}
