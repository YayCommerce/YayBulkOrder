import { useMemo } from 'react';

import { BulkOrderConfig } from '@yay-bulk-order/common/types/bulkOrder.type';

declare global {
  interface Window {
    yayBulkOrderAdminData: BulkOrderConfig;
  }
}

function getAdminData() {
  return window.yayBulkOrderAdminData;
}

export function useFormStyle() {
  return useMemo(() => {
    const stylesSettings = getAdminData().settings.styles;
    const varBorderRadius =
      stylesSettings.borderRadius === 'normal' ? '6px' : stylesSettings.borderRadius === 'large' ? '8px' : '4px';

    return {
      '--ybo-primary-color': stylesSettings.colors.primary,
      '--ybo-text-normal-color': stylesSettings.colors.textNormal,
      '--ybo-background-normal-color': stylesSettings.colors.backgroundNormal,
      '--ybo-text-secondary-color': stylesSettings.colors.textSecondary,
      '--ybo-background-secondary-color': stylesSettings.colors.backgroundSecondary,
      '--ybo-border-color': stylesSettings.colors.borderColor,
      '--ybo-border-radius': varBorderRadius,

      color: 'var(--ybo-text-normal-color)',
      backgroundColor: 'var(--ybo-background-normal-color)',
      borderColor: 'var(--ybo-border-color)',
    } as React.CSSProperties;
  }, []);
}
