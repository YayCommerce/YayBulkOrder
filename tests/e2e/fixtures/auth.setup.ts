import { test as setup } from '@playwright/test';

import { ADMIN_STATE_PATH } from '../playwright.config';
import { loginAsAdmin } from '../utils/login';

// Runs once (as the "setup" project) before any project that lists it as a
// dependency — see playwright.config.ts's "admin" project. Specs that need
// wp-admin never log in themselves; they just inherit this storage state.
setup('authenticate admin', async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().storageState({ path: ADMIN_STATE_PATH });
});
