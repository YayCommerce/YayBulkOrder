import { useBlockProps } from '@wordpress/block-editor';

export default function Save() {
  const blockProps = useBlockProps.save();

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
