import { __ } from "@wordpress/i18n";

import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

  return (
    <table {...blockProps}>
      <thead>
        <tr>
          <th colSpan={999}>Todo Table Head</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <InnerBlocks template={DEFAULT_TEMPLATE} />
        </tr>
      </tbody>
    </table>
  );
}

const DEFAULT_TEMPLATE: InnerBlocks.Props["template"] = [
  ["yay-bulk-order/column-product-title", {}],
  ["yay-bulk-order/column-product-price", {}],
  ["yay-bulk-order/column-product-stock", {}],
];
