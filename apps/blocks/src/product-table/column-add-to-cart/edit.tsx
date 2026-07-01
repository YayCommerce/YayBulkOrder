import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <td {...blockProps}>
      <button>Add To Cart</button>
    </td>
  );
}
