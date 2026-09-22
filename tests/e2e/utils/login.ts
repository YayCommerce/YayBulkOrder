import type { Page } from '@playwright/test';

// wp-env's default admin credentials.
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'password';

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/wp-login.php');
  await page.getByLabel('Username or Email Address').fill(ADMIN_USERNAME);
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('**/wp-admin/**');
}
