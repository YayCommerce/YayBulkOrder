import type { ReactNode } from 'react';
import { Settings } from '@yay-bulk-order/common/src/schemas/settings.schema';

import SavePurchaseListButton from './components/SavePurchaseListButton';

declare global {
  interface Window {
    wc?: {
      blocksCheckout?: {
        ExperimentalOrderMeta: (props: { children?: ReactNode }) => ReactNode;
      };
    };
    yayBulkOrderSlotFill: {
      ybo_meta: {
        settings: Settings;
      };
      wc_meta: {
        isCheckout: boolean;
        isCart: boolean;
      };
    };
  }
}

const Render = () => {
  const { ExperimentalOrderMeta } = window.wc?.blocksCheckout ?? {};

  if (!ExperimentalOrderMeta) {
    return null;
  }

  return (
    <ExperimentalOrderMeta>
      <SavePurchaseListButton />
    </ExperimentalOrderMeta>
  );
};

export default Render;
