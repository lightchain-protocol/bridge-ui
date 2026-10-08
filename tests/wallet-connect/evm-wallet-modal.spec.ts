import { test, expect } from '@playwright/test';

test.describe('Wallet Connect - EVM', () => {
  test('should show AppKit modal when connecting wallet for EVM chain', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByText('Send').first().waitFor({ state: 'visible' });

    // Default origin is Ethereum (EVM) - click Connect Wallet in Send section
    await page.getByRole('button', { name: 'Connect Wallet' }).nth(1).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Should show common EVM wallet options in AppKit
    await expect(dialog.getByText('MetaMask', { exact: true })).toBeVisible();
    await expect(dialog.getByText('WalletConnect', { exact: true })).toBeVisible();

    // Close the modal
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('should show AppKit connect option for BSC destination chain', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByText('Send').first().waitFor({ state: 'visible' });

    // Destination is BSC (EVM) - click Connect Wallet dropdown in Receive section
    // The destination has a dropdown menu, click it to show connect option
    const receiveSection = page.getByText('Receive').first().locator('../../..');
    await receiveSection.getByText('Connect Wallet').click();

    // Dropdown menu should appear with "Connect wallet" option
    await expect(page.getByRole('button', { name: 'Connect wallet' }).last()).toBeVisible();
  });
});
