import { expect, test } from '@playwright/test';

import { colorFieldTrigger, setColorField } from '../utils/color-picker';

// Settings (General/Design/Advanced tabs) ships in both Lite and Pro — see
// context-plugin-list.md. This file's `.admin.spec.ts` name routes it to the
// "admin" Playwright project (see playwright.config.ts), which depends on
// fixtures/auth.setup.ts and reuses that logged-in session automatically.
const SETTINGS_GENERAL_URL = '/wp-admin/admin.php?page=yay_bulk_order#/settings/general';
const SETTINGS_DESIGN_URL = '/wp-admin/admin.php?page=yay_bulk_order#/settings/design';

test.describe('Settings — General tab (admin SPA)', () => {
  test('updates and persists the default cart quantity', async ({ page }) => {
    await page.goto(SETTINGS_GENERAL_URL);

    // GeneralTab.tsx renders two plain-text number inputs in this fixed
    // order (defaultCartQuantity, then defaultPageSize) with no working
    // label association (both <label>s share one unrelated `for` — a real
    // bug, filed separately), so position within the tab panel is the only
    // reliable way to target them.
    const cartQuantityInput = page.getByRole('tabpanel').getByRole('textbox').nth(0);
    await expect(cartQuantityInput).toBeVisible();

    await cartQuantityInput.fill('9');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Settings saved!')).toBeVisible();

    // Reload from scratch to prove the value round-tripped through the real
    // REST save/read, not just React state.
    await page.reload();
    await expect(page.getByRole('tabpanel').getByRole('textbox').nth(0)).toHaveValue('9');
  });
});

test.describe('Settings — Design tab (admin SPA)', () => {
  // DesignTab.tsx spreads its 12 color fields across 3 sub-tabs — "General"
  // (headerBackground, background, primary, border), "Typography"
  // (headerText, text, textHover, description), "Button" (buttonBackground,
  // buttonBackgroundHover, buttonText, buttonTextHover). "General" is active
  // by default; the other two need their tab clicked first.

  test('updates and persists the Primary Color', async ({ page }) => {
    await page.goto(SETTINGS_DESIGN_URL);

    await setColorField(page, 'Primary Color', '#2563EB');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Settings saved!')).toBeVisible();

    // Reload from scratch to prove the value round-tripped through the real
    // REST save/read, not just React state.
    await page.reload();
    await expect(colorFieldTrigger(page, 'Primary Color')).toContainText('#2563EB', { ignoreCase: true });
  });

  test('updates and persists the remaining colors across all 3 sub-tabs', async ({ page }) => {
    await page.goto(SETTINGS_DESIGN_URL);

    // "General" sub-tab (active by default) — Header Background/Body
    // Background/Border. Primary Color has its own test above.
    await setColorField(page, 'Header Background Color', '#FDE68A');
    await setColorField(page, 'Body Background Color', '#F1F5F9');
    await setColorField(page, 'Border Color', '#94A3B8');

    await page.getByRole('tab', { name: 'Typography' }).click();
    await setColorField(page, 'Header Text Color', '#1E293B');
    await setColorField(page, 'Text Color', '#0F172A');
    await setColorField(page, 'Text Hover Color', '#334155');
    await setColorField(page, 'Description Color', '#64748B');

    await page.getByRole('tab', { name: 'Button' }).click();
    await setColorField(page, 'Button Background Color', '#16A34A');
    await setColorField(page, 'Button Background Hover Color', '#15803D');
    await setColorField(page, 'Button Text Color', '#F0FDF4');
    await setColorField(page, 'Button Text Hover Color', '#DCFCE7');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Settings saved!')).toBeVisible();

    // Reload from scratch to prove every value round-tripped through the
    // real REST save/read, not just React form state.
    await page.reload();

    await expect(colorFieldTrigger(page, 'Header Background Color')).toContainText('#FDE68A', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Body Background Color')).toContainText('#F1F5F9', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Border Color')).toContainText('#94A3B8', { ignoreCase: true });

    await page.getByRole('tab', { name: 'Typography' }).click();
    await expect(colorFieldTrigger(page, 'Header Text Color')).toContainText('#1E293B', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Text Color')).toContainText('#0F172A', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Text Hover Color')).toContainText('#334155', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Description Color')).toContainText('#64748B', { ignoreCase: true });

    await page.getByRole('tab', { name: 'Button' }).click();
    await expect(colorFieldTrigger(page, 'Button Background Color')).toContainText('#16A34A', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Button Background Hover Color')).toContainText('#15803D', {
      ignoreCase: true,
    });
    await expect(colorFieldTrigger(page, 'Button Text Color')).toContainText('#F0FDF4', { ignoreCase: true });
    await expect(colorFieldTrigger(page, 'Button Text Hover Color')).toContainText('#DCFCE7', { ignoreCase: true });
  });
});
