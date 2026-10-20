export type StoreApiCartItem = Readonly<{
  key: string;
  id: number;
  quantity: number;
  // Present on Store API responses; e.g. "sold individually" products report
  // `editable: false` once in the cart, so their quantity can't be bumped.
  quantity_limits?: Readonly<{
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  }>;
}>;

export type StoreApiCartTotals = Readonly<{
  total_price?: string;
  total_items?: string;
  currency_minor_unit?: number;
  currency_symbol?: string;
  currency_prefix?: string;
  currency_suffix?: string;
  currency_thousand_separator?: string;
  currency_decimal_separator?: string;
  [key: string]: unknown;
}>;

export type StoreApiCart = Readonly<{
  items: StoreApiCartItem[];
  itemsCount?: number;
  totals?: StoreApiCartTotals;
}>;

export type StoreApiMessages = {
  addToCartFailed?: string;
  rateLimited?: string;
};

export type StoreConfig = {
  restUrl: string;
  nonce: string;
  messages: StoreApiMessages;
};

export type StoreApiRequestOptions = {
  method?: RequestInit['method'];
  body?: Record<string, unknown>;
};

export type BatchRequestItem = {
  path: string;
  method: 'POST';
  body: Record<string, unknown>;
  headers: Record<string, string>;
};

export type BatchResponse<T> = Readonly<{
  responses: ReadonlyArray<{
    status: number;
    body: T;
  }>;
}>;

export type StoreApiVariationSelection = Readonly<{
  attribute: string;
  value: string;
}>;

/** One line item for `addProductsToCartBatch` — a product/variation row plus how much of it to add. */
export type BatchCartItem = {
  productId: number;
  quantity: number;
  variationSelections?: StoreApiVariationSelection[];
};

export type BatchAddResult = {
  cart: StoreApiCart;
  errors: string[];
  addedCount: number;
};
