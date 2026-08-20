//  #region Context Schema
// WP Context: General Context
export type GeneralContext = {
  isEmptyLists: boolean;
  page: number;
  perPage: number;
  search: string;
  isPendingCreateList: boolean;
  isPendingUpdateList: boolean;
  isPendingDeleteList: boolean;
};
// WP-EACH: Schema Product Option context
export type ProductItemContext = {
  product: Product;
};

// WP-EACH: Schema for Form Row context
export type RowItemContext = {
  row: FormRowProduct;
};

export type FormRowProduct = {
  id: number;
  productId?: number;
  quantity: number;
  subtotal: string;
  isSearching: boolean;
  isSelected: boolean;
  name: string;
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

export type PurchaseList = {
  id: number;
  name: string;
  products: {
    productId: number;
    quantity: number;
  }[];
};

export type PurchaseListForm = {
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
