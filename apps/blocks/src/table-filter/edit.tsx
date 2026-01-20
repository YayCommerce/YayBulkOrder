import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";
import { BlockEditProps } from "@wordpress/blocks";

export default function Edit(props: BlockEditProps<unknown>) {
  const blockProps = useBlockProps();

  return (
    <nav {...blockProps}>
      <button>{__("All", "yay-bulk-order")}</button>
      <button>{__("In Stock", "yay-bulk-order")}</button>
      <button>{__("Out of Stock", "yay-bulk-order")}</button>
    </nav>
  );
}
