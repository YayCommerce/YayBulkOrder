export interface CartColumnAttributes {
  variant: 'editing' | 'adding';
}

// TODO: save editingQuantity here, debounce update cart
// TODO: this state should be in the table
export type CartColumnState = {
  cartMutation: {
    state: 'idle' | 'pending' | 'error';
  };
  editingQuantity: Record<string, number>;
};

export type CartColumnContext = {
  productId: number;

  minQuantity: number;
  stepQuantity: number;
  addingQuantity: number;
  editingQuantity: number;
};
