
import { test, expect } from '@playwright/test';

test.describe('ΛΞVON OS Core Functionality', () => {
  test('should load the main canvas and allow a BEEP command', async ({ page }) => {
    // 1. Navigate to the root page.
    await page.goto('/');

    // 2. Check that the page title is correct.
    await expect(page).toHaveTitle('ΛΞVON OS');

    // 3. Find the BEEP command input field.
    const commandInput = page.locator('input[name="command"]');
    await expect(commandInput).toBeVisible();
    await expect(commandInput).toBeEnabled();
    
    // Check for the correct placeholder text.
    await expect(commandInput).toHaveAttribute('placeholder', 'Ask The Architect to...');

    // 4. Type a command and submit it.
    await commandInput.fill('launch the terminal');
    await commandInput.press('Enter');

    // 5. Verify the result of the command.
    // In this case, we expect a new "Terminal" Micro-App to appear on the canvas.
    // We can check for the card's title.
    const terminalApp = page.locator('h3:has-text("Terminal")');
    
    // Wait for the element to be visible, giving the app time to react.
    await expect(terminalApp).toBeVisible({ timeout: 10000 });
  });
});
