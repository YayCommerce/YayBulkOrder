import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <button>First</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>Last</button>
    </div>
  );
}
