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

export type ProductQuery = (
  | AllProductQuery
  | InheritProductQuery
  | CategoryProductQuery
  | FeaturedProductQuery
  | OnSaleProductQuery
  | TopRatedProductQuery
  | HandPickedProductsQuery
) & {
  hasPagination: boolean;
  pageSize?: number;
};

export type TemplateQuery = {
  cols: ('product' | 'sku' | 'description' | 'quantity' | 'subtotal' | 'add-to-cart')[];
  hasPagination: boolean;
  hasFilter: boolean;
  hasSearch: boolean;
};

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
      tags: string[];
      search: string;
      isOpen: boolean;
      // Kept as strings (not `number | null`): `data-wp-bind--value` sets
      // the input's DOM `.value` directly, and assigning JS `null` to that
      // (a non-nullable DOMString IDL attribute) renders the literal text
      // "null" in the field, not empty — empty string is the only value
      // that reliably clears the input.
      priceRange: {
        min: string;
        max: string;
      };
      // Selected star ratings (multi-select) — a product matches if its
      // rounded average rating falls in ANY of these buckets.
      ratings: number[];
    };
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
    showBackToTop: boolean;
    /** True while a pagination / filter / search click is refetching the table. */
    isTableLoading: boolean;
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
  /** Mirrors `WC_Product::is_purchasable()` — a zero price (e.g. "0") is still purchasable. */
  isPurchasable: boolean;
  quantity: number;
  /** Increment used by the +/- stepper buttons — mirrors the quantity input's `step` attribute. */
  quantityStep: number;
  isAddingToCart: boolean;
  addToCartText: string;
  cartQuantity: number;
  productType: string;
  variationSelections?: StoreApiVariationSelection[];
};

/** Context of a single checkbox rendered by table-filter-sidebar/render.php. */
export type FilterCategoryOptionContext = ProductTableContext & {
  categorySlug: string;
};

/** Context of a single rating checkbox rendered by table-filter-sidebar/render.php. */
export type FilterRatingOptionContext = ProductTableContext & {
  ratingValue: number;
};

/** Context of a single tag checkbox rendered by table-filter-sidebar/render.php. */
export type FilterTagOptionContext = ProductTableContext & {
  tagSlug: string;
};

/** Context of the price range slider wrapper rendered by table-filter-sidebar/render.php. */
export type PriceSliderContext = ProductTableContext & {
  priceBounds: { min: number; max: number };
};

/** Context of one draggable handle (min or max) within the price range slider. */
export type PriceSliderHandleContext = PriceSliderContext & {
  priceSliderHandle: 'min' | 'max';
};

export type ProductRowState = ProductRowContext & ProductTableContext;
export type TableState = ProductTableContext['tableState'];
