import type { StoreApiVariationSelection } from '@yay-bulk-order/common/src/storeApi/type';

type AllProductQuery = {
  queryType: 'all-products';
};
type InheritProductQuery = {
  /** Follow the Shop / product archive main query (category, tag, attribute, …). */
  queryType: 'inherit';
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
type TopRatedProductQuery = {
  queryType: 'top-rated';
};
type HandPickedProductsQuery = {
  queryType: 'hand-picked';
  productIds: number[];
};

export type ProductQuery =
  | AllProductQuery
  | InheritProductQuery
  | CategoryProductQuery
  | FeaturedProductQuery
  | OnSaleProductQuery
  | TopRatedProductQuery
  | HandPickedProductsQuery;

type ProductRowId = string;

export type ProductTableAttributes = {
  queryId: number;
  productQuery: ProductQuery;
  /** Editor-only: whether the user has picked a collection in the insertion placeholder. */
  hasSelectedQuery: boolean;
};

export type SelectedRow = {
  productId: number;
  quantity: number;
  variationSelections?: StoreApiVariationSelection[];
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
      categories: string[];
      search: string;
      isOpen: boolean;
    };
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
    showBackToTop: boolean;
    bulkActionOutOfView: boolean;
    hasSelectColumn: boolean;
    expandedProducts: Record<number, boolean>;
  };
};

export type ProductRowContext = {
  productId: number;
  variantId?: number;
  parentProductId?: number;
  unitPrice: number;
  quantity: number;
  isAddingToCart: boolean;
  addToCartText: string;
  cartQuantity: number;
  productType: string;
  variationSelections?: StoreApiVariationSelection[];
};

/** Context of a single checkbox rendered by table-filter/render.php. */
export type FilterCategoryOptionContext = ProductTableContext & {
  categorySlug: string;
};

export type ProductRowState = ProductRowContext & ProductTableContext;
export type TableState = ProductTableContext['tableState'];
