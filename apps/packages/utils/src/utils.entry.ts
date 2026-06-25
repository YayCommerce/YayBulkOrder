import * as utils from './utils.index';

if (undefined === window.YayBulkOrder) {
  window.YayBulkOrder = {};
}

window.YayBulkOrder.utils = utils;

declare global {
  interface Window {
    YayBulkOrder: {
      utils?: typeof utils;
    };
  }
}
