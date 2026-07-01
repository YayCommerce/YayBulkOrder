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

export type ProductTableContext = {
  formAttributes: ProductTableAttributes;
  tableState: {
    select: Record<ProductRowId, boolean>;
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
  variantId?: string;
};
