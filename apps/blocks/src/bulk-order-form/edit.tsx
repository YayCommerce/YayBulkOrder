import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import { Attributes } from "./type";
import { BlockEditProps } from "@wordpress/blocks";
import { checkUtilsIsReady } from "@yay-bulk-order/utils";
import { useEffect } from "react";

export default function Edit({ attributes }: BlockEditProps<Attributes>) {
  const blockProps = useBlockProps();

  useEffect(() => {
    checkUtilsIsReady();
  }, [attributes]);

  return (
    <div {...blockProps}>
      <InnerBlocks />
    </div>
  );
}
