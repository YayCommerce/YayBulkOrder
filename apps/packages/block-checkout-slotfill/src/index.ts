import { registerPlugin } from '@wordpress/plugins';

import Render from './render';

registerPlugin('ybod-checkout-actions', {
  render: Render,
  scope: 'woocommerce-checkout',
});
