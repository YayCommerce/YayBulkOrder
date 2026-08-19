//  #region Context Schema
// WP-EACH: Schema Product Option context
export type ProductItemContext = {
  product: Product;
};

// WP-EACH: Schema for Form Row context
export type RowItemContext = {
  row: FormRowProduct;
};

// WP-CONTEXT: Each Row has its own search context
export type ProductSearchContext = {
  isSearching: boolean;
  isSelected: boolean;
  search: string;
  subtotal: string;
};

// #endregion

// #region Store Schema
export type Product = {
  id: number;
  image: string;
  sku: string;
  name: string;
  price: number;
};

export type FormRowProduct = {
  id: number;
  // Unset until a product is picked for this row.
  productId?: number;
  quantity: number;
  subtotal: string;
};

export type FormState = {
  id: number;
  name: string;
  products: FormRowProduct[];
  total: string;
};

export type PurchaseListConfig = {
  metadata: {
    isBlockTheme: boolean;
  };
  path: {
    assetsUrl: string;
    restUrl: string;
    ajaxUrl: string;
    nonce: string;
  };
  wc_meta: {
    products: Product[];
    currencyData: {
      currency: string;
      symbol: string;
      position: string;
      thousandSep: string;
      decimalSep: string;
      numDecimals: number;
    };
  };
};
// #endregion
