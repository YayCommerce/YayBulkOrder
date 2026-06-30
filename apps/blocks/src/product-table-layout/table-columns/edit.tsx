import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <tbody {...blockProps}>
      <tr>
        <InnerBlocks template={DEFAULT_TEMPLATE} />
      </tr>
    </tbody>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [['yay-bulk-order/product-table-column-product', {}]];
