import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

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
