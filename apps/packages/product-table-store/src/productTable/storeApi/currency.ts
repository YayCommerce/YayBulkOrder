import type { GlobalConfig } from '../../utils';
import type { StoreApiCartTotals } from './type';

/** Shape both currency sources (Store API cart totals, plugin settings) get normalized into. */
type CurrencyFormatConfig = {
  minorUnit: number;
  thousandSep: string;
  decimalSep: string;
  prefix: string;
  suffix: string;
};

/** Applies thousand/decimal separators and a prefix/suffix to a raw numeric amount. */
function formatCurrencyAmount(amount: number, config: CurrencyFormatConfig): string {
  const [intPart, decPart] = amount.toFixed(config.minorUnit).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSep);
  const formatted = decPart ? `${withThousands}${config.decimalSep}${decPart}` : withThousands;

  return `${config.prefix}${formatted}${config.suffix}`;
}

function currencyConfigFromCartTotals(totals: StoreApiCartTotals): CurrencyFormatConfig {
  return {
    minorUnit: totals.currency_minor_unit ?? 2,
    thousandSep: totals.currency_thousand_separator ?? ',',
    decimalSep: totals.currency_decimal_separator ?? '.',
    prefix: totals.currency_prefix ?? totals.currency_symbol ?? '',
    suffix: totals.currency_suffix ?? '',
  };
}

function currencyConfigFromGlobalCurrency(
  currency: GlobalConfig['settings']['general']['currency'],
): CurrencyFormatConfig {
  const { decimals: minorUnit, thousandSep, decimalSep, symbol } = currency;

  switch (currency.position) {
    case 'left_space':
      return { minorUnit, thousandSep, decimalSep, prefix: `${symbol} `, suffix: '' };
    case 'right':
      return { minorUnit, thousandSep, decimalSep, prefix: '', suffix: symbol };
    case 'right_space':
      return { minorUnit, thousandSep, decimalSep, prefix: '', suffix: ` ${symbol}` };
    case 'left':
    default:
      return { minorUnit, thousandSep, decimalSep, prefix: symbol, suffix: '' };
  }
}

/** Formats a cart's grand total using the currency shape the Store API returns it in. */
export function formatCartTotal(totals: StoreApiCartTotals | undefined): string {
  if (!totals?.total_price) {
    return '';
  }

  const config = currencyConfigFromCartTotals(totals);
  const amount = Number(totals.total_price) / 10 ** config.minorUnit;

  return formatCurrencyAmount(amount, config);
}

/** Formats a single amount using the plugin's configured currency settings. */
export function formatPrice(amount: number, currency: GlobalConfig['settings']['general']['currency']): string {
  return formatCurrencyAmount(amount, currencyConfigFromGlobalCurrency(currency));
}
