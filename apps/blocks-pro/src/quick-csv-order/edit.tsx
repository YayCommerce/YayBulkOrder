import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { upload } from '@wordpress/icons';

import './style.scss';

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <div className="wp-block-yay-bulk-order-quick-csv-order">
        <div className="ybo_csv_order_header">
          <span>{__('Quick Order via CSV Upload', 'yay-bulk-order')}</span>
        </div>
        <label className="ybo_csv_order_drop_zone">
          <div className="ybo_csv_order_zone_placeholder">
            <Icon icon={upload} />
            <span>{__('Drop csv file here, or click to upload', 'yay-bulk-order')}</span>
          </div>
        </label>
        <span className="ybo_csv_order_help_text">
          {__('Upload .csv files with SKU on first column and quantity on second column.', 'yay-bulk-order')}
        </span>
        <div className="ybo_csv_order_actions">
          <Button variant="primary">{__('Add to Cart', 'yay-bulk-order')}</Button>
        </div>
      </div>
    </div>
  );
}
