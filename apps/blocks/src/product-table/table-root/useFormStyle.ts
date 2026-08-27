import { useMemo } from 'react';
import { AdminData } from '@yay-bulk-order/common/src/schemas';

declare global {
  interface Window {
    yayBulkOrderAdminData: AdminData;
  }
}

function getAdminData() {
  return window.yayBulkOrderAdminData;
}

export function useFormStyle() {
  return useMemo(() => {
    const colors = getAdminData().settings.colors;

    return {
      '--ybo-primary-color': colors['primary'],
      '--ybo-text-color': colors['text'],
      '--ybo-description-color': colors['description'],
      '--ybo-border-color': colors['border'],
      '--ybo-border-radius': '8px',
      '--ybo-background-color': colors['background'],

      color: 'var(--ybo-text-color)',
      'background-color': 'var(--ybo-background-color)',
      'border-color': 'var(--ybo-border-color)',
    } as React.CSSProperties;
  }, []);
}
