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
    const design = getAdminData().settings.design;

    return {
      '--ybo-primary-color': design['primaryColor'],
      '--ybo-text-color': design['textColor'],
      '--ybo-text-hover-color': design['textHoverColor'],
      '--ybo-description-color': design['descriptionColor'],
      '--ybo-border-color': design['borderColor'],
      '--ybo-background-color': design['backgroundColor'],
      '--ybo-button-background-color': design['buttonBackgroundColor'],
      '--ybo-button-background-hover-color': design['buttonBackgroundHoverColor'],
      '--ybo-button-text-color': design['buttonTextColor'],
      '--ybo-button-text-hover-color': design['buttonTextHoverColor'],

      color: 'var(--ybo-text-color)',
      'background-color': 'var(--ybo-background-color)',
      'border-color': 'var(--ybo-border-color)',
    } as React.CSSProperties;
  }, []);
}
