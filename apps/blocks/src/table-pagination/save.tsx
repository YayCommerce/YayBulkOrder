import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";
import { BlockSaveProps } from "@wordpress/blocks";

export default function Save(props: BlockSaveProps<unknown>) {
  const blockProps = useBlockProps.save();

  return (
    <ul {...blockProps}>
      <li>
        <button>{__("Previous", "yay-bulk-order")}</button>
      </li>
      <li>
        <button>{__("Next", "yay-bulk-order")}</button>
      </li>
    </ul>
  );
}
