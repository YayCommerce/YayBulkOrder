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

export type ProductTableAttributes = {
  queryId: number;
  productQuery: ProductQuery;
};

export type ProductTableContext = {
  formAttributes: ProductTableAttributes;
  queryState: {
    filter: {
      currentPage: number;
      categoryId?: number;
      keyword?: string;
    };
  };
  queryResult: {
    totalLength: number;
  };
};
