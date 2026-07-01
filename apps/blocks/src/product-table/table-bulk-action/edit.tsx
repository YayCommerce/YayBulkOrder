import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <button>Add {100} Item(s) to Cart</button>
    </div>
  );
}
