import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <table {...blockProps}>
      <thead>
        <tr>
          <th colSpan={999}>Todo Table Head</th>
        </tr>
      </thead>
      <InnerBlocks />
      <tfoot>
        <tr>
          <td colSpan={999}>Todo Table Foot</td>
        </tr>
      </tfoot>
    </table>
  );
}
