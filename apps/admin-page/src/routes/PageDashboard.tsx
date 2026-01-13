import { useEffect } from 'react';
import { checkUtilsIsReady } from '@yay-bulk-order/utils';

export default function PageDashboard() {
  useEffect(() => {
    checkUtilsIsReady();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>Guides: Bulk Order Form Block</div>
      <div>Guides: Bulk Order Form Patterns</div>
      <div>Guides: Bulk Order Form Shortcode</div>
    </div>
  );
}
