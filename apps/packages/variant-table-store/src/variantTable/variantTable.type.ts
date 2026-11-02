import type { StoreApiVariationSelection } from '@yay-bulk-order/common/src/storeApi/type';

type VariantRowId = string;

export type VariantTableAttributes = {
  /** `0` means "auto-detect from the Single Product context" (see `usesContext: ["postId"]`). */
  productId: number;
  /** Editor-only: whether the user has picked a product in the insertion placeholder. */
  hasSelectedProduct: boolean;
};

export type SelectedVariantRow = {
  variationId: number;
  quantity: number;
  unitPrice: number;
  variationSelections?: StoreApiVariationSelection[];
};

export type VariantTableContext = {
  formAttributes: VariantTableAttributes;
  tableState: {
    select: Record<VariantRowId, SelectedVariantRow>;
    bulkAdding: boolean;
    cartNotice: {
      visible: boolean;
      totalFormatted: string;
    };
    cartError: {
      messages: string[];
    };
    bulkActionOutOfView: boolean;
  };
};

export type VariantRowContext = {
  variationId: number;
  unitPrice: number;
  quantity: number;
  /** Increment used by the +/- stepper buttons — mirrors the quantity input's `step` attribute. */
  quantityStep: number;
  cartQuantity: number;
  variationSelections?: StoreApiVariationSelection[];
};

export type VariantRowState = VariantRowContext & VariantTableContext;
export type TableState = VariantTableContext['tableState'];
