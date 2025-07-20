import { expect, Page } from "@playwright/test"
import { MetaMask } from "@synthetixio/synpress/playwright"

/**
 * Extract balance from text containing ETH amount
 * @param balanceText - Text containing balance like "Balance: 0.002" or "0.002 ETH"
 * @returns Numeric balance value
 */
export function extractBalance(balanceText: string | null): number {
  if (!balanceText) return 0
  // Match patterns like "Balance: 0.002" or "0.002 ETH"
  const match = balanceText.match(/([\d.]+)\s*(?:ETH)?/)
  return match ? Number.parseFloat(match[1]) : 0
}

/**
 * Close all open dialogs and panels
 * @param page - Playwright page object
 */
export async function closeAllDialogs(page: Page): Promise<void> {
  console.log("Checking for open panels...")

  // Look for any close button with aria-label="Close"
  const closeButtons = await page.locator('button[aria-label="Close"]').all()
  for (const button of closeButtons) {
    if (await button.isVisible()) {
      await button.click()
      console.log("Closed a panel")
      // Wait for the button to disappear
      await expect(button).toBeHidden({ timeout: 2000 })
    }
  }

  // Also check for any visible sheets/dialogs and close them
  const dialogs = await page.locator('[role="dialog"]:visible').all()
  if (dialogs.length > 0) {
    console.log(`Found ${dialogs.length} open dialog(s), attempting to close...`)
    // Press Escape to close any open dialogs
    await page.keyboard.press("Escape")
    // Wait for dialogs to close
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0, { timeout: 2000 })
  }
}

/**
 * Verify the play button is ready for another bet
 * @param page - Playwright page object
 * @param screenshotName - Name for screenshot if button not found
 * @returns True if play button is ready
 */
export async function verifyCanPlayAgain(
  page: Page,
  screenshotName = "cannot-play-again.png",
): Promise<boolean> {
  // The play button should be visible and show either "Place Bet" or "Try again"
  // After a successful bet, it shows "Try again"
  const playAgainButton = page.locator('button:has-text("Place Bet"), button:has-text("Try again")')
  const canPlayAgain = await playAgainButton.isVisible({ timeout: 5000 }).catch(() => false)

  if (canPlayAgain) {
    console.log("Play button is ready for another bet")
  } else {
    // If play button not found, take screenshot for debugging
    await page.screenshot({ path: screenshotName, fullPage: true })
    console.log("Cannot find play button, screenshot saved")

    // Check what text the button currently has
    const allButtons = await page.locator("button").all()
    for (const button of allButtons) {
      const text = await button.textContent()
      if (text && !text.includes("Max") && !text.includes("History") && !text.includes("Info")) {
        console.log(`Button found with text: "${text}"`)
      }
    }
  }

  return canPlayAgain
}

/**
 * Wait for button to go through betting states
 * @param page - Playwright page object
 */
export async function waitForBettingStates(page: Page): Promise<void> {
  console.log("Waiting for bet to be processed...")

  // After confirming transaction, button should show "Placing Bet..."
  const placingBetButton = page.getByRole("button", { name: "Placing Bet..." })
  const hasPlacingState = await placingBetButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasPlacingState) {
    console.log("Transaction is being placed...")
    await expect(placingBetButton).toBeHidden({ timeout: 30000 })
  }

  // Then it should show "Loading Bet..." while waiting for confirmation
  const loadingBetButton = page.getByRole("button", { name: "Loading Bet..." })
  const hasLoadingState = await loadingBetButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasLoadingState) {
    console.log("Waiting for transaction confirmation...")
    await expect(loadingBetButton).toBeHidden({ timeout: 120000 })
  }

  // Finally it should show "Bet rolling..." while the bet is being resolved
  const rollingButton = page.getByRole("button", { name: "Bet rolling..." })
  const hasRollingState = await rollingButton.isVisible({ timeout: 5000 }).catch(() => false)
  if (hasRollingState) {
    console.log("Bet is rolling...")
    await expect(rollingButton).toBeHidden({ timeout: 120000 })
  }

  console.log("Bet processing completed!")
}

/**
 * Ensure wallet is on the specified chain, switch if necessary
 * @param metamask - MetaMask instance
 * @param page - Playwright page object
 * @param chainName - Name of the chain (e.g., "Base", "Polygon")
 * @param expectedToken - Expected token symbol for balance verification (e.g., "ETH", "POL")
 * @returns True if chain switch was successful
 */
export async function ensureWalletOnChain(
  metamask: MetaMask,
  page: Page,
  chainName: string,
  expectedToken: string,
): Promise<boolean> {
  console.log(`\n=== SWITCHING TO ${chainName.toUpperCase()} CHAIN ===`)

  try {
    // Always switch to the requested chain
    console.log(`Switching wallet to ${chainName} network...`)
    await metamask.switchNetwork(chainName)
    await page.waitForTimeout(3000)

    // Reload page to ensure chain change is reflected
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Verify balance shows expected token
    const balanceElement = page.locator("text=/Balance:/").first()
    const isBalanceVisible = await balanceElement.isVisible({ timeout: 10000 }).catch(() => false)

    if (isBalanceVisible) {
      const balanceContainer = await balanceElement.locator("..").first()
      const balanceText = await balanceContainer.textContent()

      if (!balanceText?.includes(expectedToken)) {
        console.log(`❌ Balance shows wrong token for ${chainName} chain`)
        console.log(`Expected: ${expectedToken} balance, Got:`, balanceText)
        return false
      }

      console.log(`✅ Confirmed ${expectedToken} balance on ${chainName} chain:`, balanceText)
    }

    return true
  } catch (error) {
    console.log(`❌ Error switching to ${chainName} chain:`, error)
    return false
  }
}
