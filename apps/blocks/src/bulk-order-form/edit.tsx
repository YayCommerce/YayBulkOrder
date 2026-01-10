import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { FormAttributes } from './type';

export default function Edit({
  attributes,
  setAttributes,
  ...props
}: BlockEditProps<FormAttributes>) {
  const blockProps = useBlockProps();

  return (
    <p {...blockProps}>
      {__(
        'Example Interactive TypeScript – hello from the editor!',
        'example-interactive-typescript',
      )}
    </p>
  );
}
