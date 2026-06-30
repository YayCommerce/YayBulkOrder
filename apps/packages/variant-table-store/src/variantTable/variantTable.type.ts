type VariantRowId = string;
type VariantTermId = string;

export type VariantTableAttributes = {
  productId: number;
};

export type VariantTableContext = {
  formAttributes: VariantTableAttributes;
  tableState: {
    select: Record<VariantRowId, boolean>;
    filter: Record<VariantTermId, string>;
  };
};
