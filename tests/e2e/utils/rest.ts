import { Page } from '@playwright/test';

export type RestResponse<T = unknown> = { status: number; body: T };

/**
 * Call the WordPress REST API from the logged-in page, with a fresh REST nonce.
 * The page must already be on the test site (any URL), so the cookies apply.
 */
export async function rest<T = unknown>(
  page: Page,
  route: string,
  method = 'GET',
  body?: unknown,
): Promise<RestResponse<T>> {
  return page.evaluate(
    async ([route, method, body]) => {
      const nonce = await fetch('/wp-admin/admin-ajax.php?action=rest-nonce').then((r) => r.text());
      const response = await fetch(`/wp-json/${route}`, {
        method,
        headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: response.status, body: await response.json().catch(() => null) };
    },
    [route, method, body] as const,
  ) as Promise<RestResponse<T>>;
}

/** The plugin's settings, as the Settings page saves them. */
export type PluginSettings = {
  purchaseList: {
    isAddToAccountPage: boolean;
    savePurchaseListButton: {
      isAddToCartPage: boolean;
      isAddToCheckoutPage: boolean;
      isAddToMiniCart: boolean;
      isAddToOrder: boolean;
    };
  };
  csvOrder: { isAddToAccountPage: boolean };
  [key: string]: unknown;
};

/**
 * Change the plugin settings for a test. Returns a function that restores the
 * settings it found, for afterAll/afterEach; pass it any open page of the site.
 */
export async function changeSettings(
  page: Page,
  change: (settings: PluginSettings) => void,
): Promise<(page: Page) => Promise<void>> {
  const before = (await rest<PluginSettings>(page, 'yay-bulk-order/v1/settings')).body;
  const after = structuredClone(before);
  change(after);
  await rest(page, 'yay-bulk-order/v1/settings', 'POST', after);
  return async (openPage: Page) => {
    await rest(openPage, 'yay-bulk-order/v1/settings', 'POST', before);
  };
}

/**
 * Empty the WooCommerce cart of the page's session, through the Store API.
 * Uses the context's HTTP client (same cookies), so a navigation in the page
 * can't interrupt it.
 */
export async function emptyCart(page: Page): Promise<void> {
  const cart = await page.request.get('/wp-json/wc/store/v1/cart');
  await page.request.delete('/wp-json/wc/store/v1/cart/items', {
    headers: { Nonce: cart.headers()['nonce'] ?? '' },
  });
}

/** The cart's items as `{ sku: quantity }`, through the Store API. */
export async function cartQuantities(page: Page): Promise<Record<string, number>> {
  const cart = await (await page.request.get('/wp-json/wc/store/v1/cart')).json();
  const quantities: Record<string, number> = {};
  for (const item of cart.items as { sku: string; quantity: number }[]) {
    quantities[item.sku] = item.quantity;
  }
  return quantities;
}
