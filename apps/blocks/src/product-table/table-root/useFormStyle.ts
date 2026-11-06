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
      '--ybod-primary-color': colors['primary'],
      '--ybod-text-color': colors['text'],
      '--ybod-text-hover-color': colors['textHover'],
      '--ybod-description-color': colors['description'],
      '--ybod-border-color': colors['border'],
      '--ybod-border-radius': '8px',
      '--ybod-background-color': colors['background'],
      '--ybod-button-background-color': colors['buttonBackground'],
      '--ybod-button-background-hover-color': colors['buttonBackgroundHover'],
      '--ybod-button-text-color': colors['buttonText'],
      '--ybod-button-text-hover-color': colors['buttonTextHover'],
      '--ybod-header-text-color': colors['headerText'],
      '--ybod-header-background-color': colors['headerBackground'],

      color: 'var(--ybod-text-color)',
      'border-color': 'var(--ybod-border-color)',
    } as React.CSSProperties;
  }, []);
}
