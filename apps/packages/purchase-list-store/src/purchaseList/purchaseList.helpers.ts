import { PurchaseListConfig } from './purchaseList.type';

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
