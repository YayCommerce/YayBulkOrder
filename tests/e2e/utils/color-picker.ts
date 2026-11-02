import { expect, type Page } from '@playwright/test';

// Shared helper for components/ui/color-picker.tsx (used across all of
// Settings > Design). It's a Popover whose trigger sets `role="combobox"`
// explicitly (won't match getByRole('button')) and shows the current hex
// value as its own text, uppercase. Scope by the field's label text, not
// position — DesignTab.tsx spreads 12 color fields across 3 sub-tabs, and
// switching sub-tabs changes what's currently visible.
function colorField(page: Page, label: string) {
  // Exact match required: several labels are substrings of another
  // ("Text Color" vs "Header Text Color", "Background Color" vs "Header
  // Background Color"/"Body Background Color"/"Button Background Color"),
  // so a plain `hasText` (substring) filter is ambiguous.
  return page.locator('[data-slot="field"]').filter({ has: page.getByText(label, { exact: true }) });
}

export function colorFieldTrigger(page: Page, label: string) {
  return colorField(page, label).getByRole('combobox');
}

export async function setColorField(page: Page, label: string, hex: string): Promise<void> {
  const trigger = colorFieldTrigger(page, label);
  await trigger.click();
  await page.getByRole('textbox').first().fill(hex);
  // Typing debounces into form state (200ms) before the trigger's own label
  // re-renders — assert instead of an arbitrary wait.
  await expect(trigger).toContainText(hex, { ignoreCase: true });
  await page.keyboard.press('Escape');
  // The Popover's exit animation keeps its hex input mounted for a beat
  // after `data-state` flips to closed. Without waiting it out, the next
  // color field's `getByRole('textbox').first()` can grab this stale input
  // instead of the new one and silently edit the wrong field.
  await expect(page.getByRole('textbox')).toHaveCount(0);
}
