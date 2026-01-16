import { __ } from "@wordpress/i18n";

import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import { BlockSaveProps } from "@wordpress/blocks";

export default function Save(props: BlockSaveProps<unknown>) {
  const blockProps = useBlockProps.save();

  return (
    <table {...blockProps}>
      <thead>
        <tr>
          <th colSpan={999}>Todo Table Head</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <InnerBlocks.Content />
        </tr>
      </tbody>
    </table>
  );
}
