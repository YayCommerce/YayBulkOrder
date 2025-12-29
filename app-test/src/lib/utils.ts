import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { DateRange } from 'react-day-picker';

export { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const __ = (text: string): string => {
  const translations = window.yayBulkOrderWpData.i18n || {};
  return translations[text] || text;
};

export const formatDateRange = (range: DateRange | undefined) => {
  if (!range?.from) return __('Pick a date range');

  if (range.to) {
    return `${format(range.from, 'MMM dd, yyyy')} - ${format(range.to, 'MMM dd, yyyy')}`;
  }

  return format(range.from, 'MMM dd, yyyy');
};


