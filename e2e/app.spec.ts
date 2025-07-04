import { test, expect } from '@playwright/test';

test.describe('BEEP Command Core Flows', () => {
  test('should launch a simple app via command', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('ΛΞVON OS');

    const commandInput = page.locator('input[name="command"]');
    await expect(commandInput).toBeVisible();

    await commandInput.fill('launch the terminal');
    await commandInput.press('Enter');

    const terminalApp = page.locator('div[data-app-type="terminal"] h3:has-text("Terminal")');
    await expect(terminalApp).toBeVisible({ timeout: 15000 });
  });

  test('should allow creating and viewing a contact via commands', async ({ page }) => {
    await page.goto('/');

    const commandInput = page.locator('input[name="command"]');
    
    const uniqueEmail = `playwright-test-${Date.now()}@aevonos.com`;
    const contactName = 'Playwright Test';
    await commandInput.fill(`create a contact for ${contactName} with email ${uniqueEmail}`);
    await commandInput.press('Enter');

    await expect(commandInput).toBeEnabled({ timeout: 15000 });
    
    await expect(page.locator('div[role="status"]:has-text("BEEP")')).toBeVisible({ timeout: 10000 });

    await commandInput.fill('launch contact list');
    await commandInput.press('Enter');

    const contactListApp = page.locator('div[data-app-type="contact-list"]');
    await expect(contactListApp).toBeVisible({ timeout: 15000 });

    const newContactCard = contactListApp.locator(`div:has-text("${contactName}"):has-text("${uniqueEmail}")`);
    await expect(newContactCard).toBeVisible({ timeout: 15000 });
  });
});
