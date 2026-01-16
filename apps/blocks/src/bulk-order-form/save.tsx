import { InnerBlocks } from "@wordpress/block-editor";
import { Attributes } from "./type";
import { BlockSaveProps } from "@wordpress/blocks";

export default function Save(props: BlockSaveProps<Attributes>) {
  return <InnerBlocks.Content />;
}
