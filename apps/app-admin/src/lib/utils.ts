import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export const isPro = import.meta.env.VITE_PLAN === 'pro';
export const isLite = !isPro;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      transition: ['transition-default'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Plugin asset URL with ?ver= so browsers refetch it after each plugin update. */
export function assetUrl(path: string) {
  const { assetsUrl, version } = window.yayBulkOrderMeta.bulkOrderMeta;
  return `${assetsUrl}/${path.replace(/^\//, '')}?ver=${version}`;
}
