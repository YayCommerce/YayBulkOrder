import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

export default function Edit(props: BlockEditProps) {
  const { attributes, context } = props;
  const blockProps = useBlockProps();

  return (
    <table {...blockProps}>
      <thead>
        <tr>
          <th colSpan={999}>Todo Table Head</th>
        </tr>
      </thead>
      <tbody>
        {/* <tr>
          <td colSpan={999}>
            <pre>Debug: {JSON.stringify({ attributes, context }, null, 2)}</pre>
          </td>
        </tr> */}
        <tr>
          <InnerBlocks template={DEFAULT_TEMPLATE} />
        </tr>
      </tbody>
    </table>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props['template'] = [
  ['yay-bulk-order/column-product-title', {}],
  ['yay-bulk-order/column-product-price', {}],
  ['yay-bulk-order/column-product-stock', {}],
  ['yay-bulk-order/column-add-to-cart', {}],
];
