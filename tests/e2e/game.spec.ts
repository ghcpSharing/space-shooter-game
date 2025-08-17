import { test, expect } from '@playwright/test'

// Basic E2E to ensure the Phaser canvas boots and menu shows.
// Also verifies pressing Enter transitions to GameScene by checking for Score UI.

test.describe('Space Shooter E2E', () => {
  test('loads menu and starts game', async ({ page }) => {
    await page.goto('/')

    // Title from React wrapper
    await expect(page.getByText('SPACE SHOOTER')).toBeVisible()

    // Ensure Phaser has injected a canvas element
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    // Menu scene hint text exists
    await expect(page.getByText('PRESS ENTER')).toBeVisible()

    // Press Enter to start game
    await page.keyboard.press('Enter')

    // In GameScene, we expect a score text to appear and be non-empty
    // Allow a brief delay for scene transition and preload
    await expect(page.getByText(/Score:\s*\d+/)).toBeVisible({ timeout: 5000 })

    // Optionally press Space to fire and ensure still running
    await page.keyboard.down('Space')
    await page.waitForTimeout(200)
    await page.keyboard.up('Space')

    // Lives text should be present
    await expect(page.getByText(/Lives:\s*\d+/)).toBeVisible()
  })
})
