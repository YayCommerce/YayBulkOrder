type AllProductQuery = {
  queryType: 'all-products';
};
type CategoryProductQuery = {
  queryType: 'by-category';
  categoryIds: number[];
};
type FeaturedProductQuery = {
  queryType: 'featured';
};
type OnSaleProductQuery = {
  queryType: 'on-sale';
};
type HandPickedProductsQuery = {
  queryType: 'hand-picked';
  productIds: number[];
};

export type ProductQuery =
  | AllProductQuery
  | CategoryProductQuery
  | FeaturedProductQuery
  | OnSaleProductQuery
  | HandPickedProductsQuery;

type ProductRowId = string;

export type ProductTableAttributes = {
  queryId: number;
  productQuery: ProductQuery;
};

export type SelectedRow = {
  productId: number;
  quantity: number;
};

export type ProductTableContext = {
  formAttributes: ProductTableAttributes;
  tableState: {
    select: Record<ProductRowId, SelectedRow>;
    bulkAdding: boolean;
    cartNotice: {
      visible: boolean;
      totalFormatted: string;
    };
    filter: {
      categoryIds?: number[];
      searchKeyword?: string;
      purchaseListId?: number;
    };
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
  };
};

export type ProductRowContext = {
  productId: number;
  variantId?: number;
  unitPrice: number;
  quantity: number;
  isAddingToCart: boolean;
  addToCartText: string;
  cartQuantity: number;
  productType: string;
};
