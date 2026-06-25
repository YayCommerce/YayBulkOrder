import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import {
  PanelBody,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { CartColumnAttributes } from './type';

export default function Edit({ attributes, setAttributes }: BlockEditProps<CartColumnAttributes>) {
  const { variant } = attributes;
  const variantClassname = variant === 'adding' ? 'adding-variant' : 'editing-variant';
  const { className, ...blockProps } = useBlockProps();

  return (
    <td {...blockProps} className={`${className ?? ''} ${variantClassname}`}>
      <InspectorControls>
        <PanelBody title={__('Configure', 'yay-bulk-order')}>
          <ToggleGroupControl
            label={__('Variant', 'yay-bulk-order')}
            isBlock
            help={__('Edit Cart Quantity or Add to Cart Button', 'yay-bulk-order')}
            value={variant}
            onChange={(value: CartColumnAttributes['variant']) => setAttributes({ variant: value })}
          >
            <ToggleGroupControlOption value="editing" label={__('Editing', 'yay-bulk-order')} />
            <ToggleGroupControlOption value="adding" label={__('Adding', 'yay-bulk-order')} />
          </ToggleGroupControl>
        </PanelBody>
      </InspectorControls>

      {variant === 'adding' && (
        <div style={{ display: 'flex', gap: '1px' }}>
          <input
            style={{ width: '40px' }}
            type="number"
            value={window.yayBulkOrderAdminData.settings.general.defaultCartQuantity}
            readOnly
          />
          <button>Add to Cart</button>
        </div>
      )}

      {variant === 'editing' && (
        <div style={{ display: 'flex', gap: '1px' }}>
          <input
            style={{ width: '40px' }}
            type="number"
            value={window.yayBulkOrderAdminData.settings.general.defaultCartQuantity}
            readOnly
          />
          <button>+</button>
          <button>-</button>
        </div>
      )}
    </td>
  );
}
