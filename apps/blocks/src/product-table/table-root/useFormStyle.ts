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
      '--ybo-text-hover-color': colors['textHover'],
      '--ybo-description-color': colors['description'],
      '--ybo-border-color': colors['border'],
      '--ybo-background-color': colors['background'],
      '--ybo-button-background-color': colors['buttonBackground'],
      '--ybo-button-background-hover-color': colors['buttonBackgroundHover'],
      '--ybo-button-text-color': colors['buttonText'],
      '--ybo-button-text-hover-color': colors['buttonTextHover'],

      color: 'var(--ybo-text-color)',
      'background-color': 'var(--ybo-background-color)',
      'border-color': 'var(--ybo-border-color)',
    } as React.CSSProperties;
  }, []);
}
