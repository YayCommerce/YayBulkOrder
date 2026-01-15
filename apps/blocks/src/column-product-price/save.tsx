import { useBlockProps } from "@wordpress/block-editor";
import { BlockSaveProps } from "@wordpress/blocks";

export default function Save(props: BlockSaveProps<unknown>) {
  const blockProps = useBlockProps.save();

  return <td {...blockProps}>Product Price</td>;
}
