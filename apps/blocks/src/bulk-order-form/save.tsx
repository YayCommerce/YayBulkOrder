import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";
import { Attributes } from "./type";
import { BlockSaveProps } from "@wordpress/blocks";

export default function Save(props: BlockSaveProps<Attributes>) {
  const blockProps = useBlockProps.save();

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}
