import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

import './style.scss';

const SAMPLE_DATA = [
  {
    id: 1,
    name: __('Weekly Order', 'yay-bulk-order'),
    itemCount: 2,
  },
  {
    id: 2,
    name: __('Monthly Restock', 'yay-bulk-order'),
    itemCount: 12,
  },
  {
    id: 3,
    name: __('Favorite Items', 'yay-bulk-order'),
    itemCount: 4,
  },
];

export default function Edit(props: BlockEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <div className="wp-block-yay-bulk-order-purchase-list">
        <div className="ybo_header">
          <h2>{__('Purchase lists', 'yay-bulk-order')}</h2>
          <Button variant="primary" icon={plus}>
            {__('New List', 'yay-bulk-order')}
          </Button>
        </div>
        <div className="ybo_table_wrapper">
          <table>
            <thead>
              <tr>
                <th>{__('List name', 'yay-bulk-order')}</th>
                <th>{__('Number of items', 'yay-bulk-order')}</th>
                <th>{__('Actions', 'yay-bulk-order')}</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.map((list) => (
                <tr key={list.id}>
                  <td className="ybo_purchase_list_item_name">{list.name}</td>
                  <td>
                    {sprintf(
                      /* translators: %d: number of items in the list */
                      __('%d items', 'yay-bulk-order'),
                      list.itemCount,
                    )}
                  </td>
                  <td className="ybo_purchase_list_item_actions">
                    <Button variant="secondary">
                      <span>{__('View', 'yay-bulk-order')}</span>
                    </Button>
                    <Button variant="secondary">
                      <span>{__('Download', 'yay-bulk-order')}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
