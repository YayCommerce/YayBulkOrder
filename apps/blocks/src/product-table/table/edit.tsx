import { InnerBlocks, InspectorControls, PanelColorSettings, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

import { buildColorStyle, getColorLabel, getColorPanels, TableColors } from './colors';

type TableAttributes = {
  colors: TableColors;
};

export default function Edit({ attributes, setAttributes }: BlockEditProps<TableAttributes>) {
  const { style, ...blockProps } = useBlockProps();
  const colors = attributes.colors ?? {};

  const setColor = (key: keyof TableColors) => (value: string | undefined) => {
    setAttributes({ colors: { ...colors, [key]: value } });
  };

  return (
    <>
      <InspectorControls>
        {getColorPanels().map((panel) => (
          <PanelColorSettings
            key={panel.title}
            title={panel.title}
            colorSettings={panel.keys.map((key) => ({
              value: colors[key],
              onChange: setColor(key),
              label: getColorLabel(key),
            }))}
          />
        ))}
      </InspectorControls>
      <div style={{ ...style, ...buildColorStyle(colors) }} {...blockProps}>
        <InnerBlocks />
      </div>
    </>
  );
}
