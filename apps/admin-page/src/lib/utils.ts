import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SettingsFormData } from './schemas/settings.schema';

export { type ClassValue, clsx } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSettings() {
  return window.yayBulkOrderAdminData.settings;
}

export function setSettings(settings: SettingsFormData) {
  window.yayBulkOrderAdminData = {
    ...window.yayBulkOrderAdminData,
    settings,
  };
}
