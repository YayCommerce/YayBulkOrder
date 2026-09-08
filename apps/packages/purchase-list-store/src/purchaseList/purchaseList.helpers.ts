import { FormRowProduct, Product, PurchaseListConfig } from './purchaseList.type';

export const parseCurrency = (price: string | number, currencyData: PurchaseListConfig['wc_meta']['currencyData']) => {
  if (typeof price === 'string') {
    price = parseFloat(price);
  }

  const { decimalSep, numDecimals, position, symbol, thousandSep } = currencyData;

  const formattedPrice = price
    .toFixed(numDecimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
    .replace(/(\d+)\.(\d{2})$/, `$1${decimalSep}$2`);

  switch (position) {
    case 'right':
      return `${formattedPrice}${symbol}`;
    case 'left_space':
      return `${symbol} ${formattedPrice}`;
    case 'right_space':
      return `${formattedPrice} ${symbol}`;
    case 'left':
    default:
      return `${symbol}${formattedPrice}`;
  }
};

export const downloadAsset = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function getSearchableProducts(
  all_products: Product[],
  selectedProducts: FormRowProduct[],
  excludeRowId: number,
) {
  const selectedProductIds = new Set(
    selectedProducts
      .filter((row) => row.id !== excludeRowId && row.productId !== undefined)
      .map((row) => row.productId),
  );

  return all_products.filter((product) => !selectedProductIds.has(product.id));
}
