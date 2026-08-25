import { registerPlugin } from '@wordpress/plugins';

import Render from './render';

registerPlugin('ybo-checkout-actions', {
  render: Render,
  scope: 'woocommerce-checkout',
});
