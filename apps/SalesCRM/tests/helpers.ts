import { type Page, expect } from '@playwright/test';

/**
 * Wait for the app to finish loading by checking for common loading indicators.
 */
export async function waitForAppLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a page and wait for it to load.
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForAppLoad(page);
}

/**
 * Assert the current URL contains the given path.
 */
export async function assertUrl(page: Page, path: string) {
  await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

/**
 * Click a sidebar navigation link by text content.
 */
export async function clickSidebarLink(page: Page, linkText: string) {
  await page.getByTestId('sidebar').getByRole('link', { name: linkText }).click();
  await waitForAppLoad(page);
}

/**
 * Open the action menu ("...") on a row by index or by locator.
 */
export async function openRowActionMenu(_page: Page, rowLocator: ReturnType<Page['locator']>) {
  await rowLocator.getByTestId('row-action-menu').click();
}

/**
 * Fill a form field by label text.
 */
export async function fillFormField(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

/**
 * Select an option from a dropdown by label.
 */
export async function selectOption(page: Page, label: string, value: string) {
  await page.getByLabel(label).selectOption(value);
}

/**
 * Count the number of elements matching a test ID.
 */
export async function countByTestId(page: Page, testId: string): Promise<number> {
  return await page.getByTestId(testId).count();
}
