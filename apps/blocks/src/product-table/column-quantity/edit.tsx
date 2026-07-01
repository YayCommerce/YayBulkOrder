import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <td {...blockProps}>
      <input type="number" value="5" />
    </td>
  );
}
