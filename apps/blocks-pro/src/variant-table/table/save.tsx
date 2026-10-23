import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';

import { buildColorStyle, TableColors } from './colors';

type TableAttributes = {
  colors: TableColors;
};

export default function Save({ attributes }: BlockSaveProps<TableAttributes>) {
  const { style, ...saveProps } = useBlockProps.save() as Record<string, unknown> & {
    style?: React.CSSProperties;
  };

  return (
    <table style={{ ...style, ...buildColorStyle(attributes.colors ?? {}) }} {...saveProps}>
      <InnerBlocks.Content />
    </table>
  );
}
