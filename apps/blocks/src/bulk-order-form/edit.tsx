import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";
import { Attributes } from "./type";
import { BlockEditProps } from "@wordpress/blocks";

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<Attributes>) {
  const blockProps = useBlockProps();

  return (
    <p {...blockProps}>
      {__(
        "Example Interactive TypeScript – hello from the editor!",
        "example-interactive-typescript",
      )}
    </p>
  );
}
