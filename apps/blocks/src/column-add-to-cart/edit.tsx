import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

  return <td {...blockProps}>Add to Cart</td>;
}
