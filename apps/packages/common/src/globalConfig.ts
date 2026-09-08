import type { Currency, Meta, Settings } from './schemas';
import { getConfig } from '@wordpress/interactivity';

/** Configuration is readonly. Store path, meta, admin settings */
export type GlobalConfig = {
  settings: Pick<Settings, 'colors' | 'general'>;
  wpMeta: Meta['wpMeta'];
  bulkOrderMeta: Meta['bulkOrderMeta'];
  currency: Currency;
};

export function getGlobalConfig() {
  return getConfig('yay-bulk-order/global-config') as GlobalConfig;
}
