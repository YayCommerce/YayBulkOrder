import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const __ = (text: string): string => {
  const translations = window.yayBulkOrderWpData.i18n || {};
  return translations[text] || text;
};


