import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

// Helper function to extract balance from text
function extractBalance(balanceText: string | null): number {
  if (!balanceText) return 0
  // Match patterns like "Balance: 0.002" or "0.002 ETH"
  const match = balanceText.match(/([\d.]+)\s*(?:ETH)?/)
  return match ? Number.parseFloat(match[1]) : 0
}

// Helper function to close dialogs
async function closeDialogs(page: any) {
  // Try aria-label="Close" first (best practice)
  const closeButton = page.locator('button[aria-label="Close"]').first()
  if (await closeButton.isVisible({ timeout: 2000 })) {
    await closeButton.click()
    await page.waitForTimeout(500)
    return true
  }
  return false
}

test.describe("Coin Toss Game", () => {
  test("should play coin toss with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to coin toss game
    await page.goto("/coinToss.html")
    await page.waitForLoadState("networkidle")

    // Connect wallet
    console.log("\n=== CONNECTING WALLET ===")
    const connectButton = page.getByTestId("ockConnectButton")
    await expect(connectButton).toBeVisible()
    await connectButton.click()

    const onchainkitModal = page.locator('[data-testid="ockModalOverlay"]')
    await expect(onchainkitModal).toBeVisible()
    const metamaskBtn = onchainkitModal.getByRole("button").filter({ hasText: /metamask/i })
    await metamaskBtn.click()

    await metamask.connectToDapp()
    const address = await metamask.getAccountAddress()
    console.log("Connected wallet address:", address)

    // Wait for wallet connection to complete
    const walletConnectedBtn = page.locator('[data-testid="ockConnectWallet_Connected"]')
    await expect(walletConnectedBtn).toBeVisible({ timeout: 10000 })

    // Check current balance
    console.log("\n=== CHECKING WALLET STATUS ===")

    // Wait for balance to be visible
    const balanceElement = page.locator("text=/Balance:/").first()
    await expect(balanceElement).toBeVisible({ timeout: 20000 })

    // Get initial balance
    const balanceContainer = await balanceElement.locator("..").first()
    const initialBalanceText = await balanceContainer.textContent()
    console.log("Initial balance text:", initialBalanceText)

    const initialBalance = extractBalance(initialBalanceText)
    console.log("Initial balance amount:", initialBalance)

    // Check if wallet has sufficient balance
    if (initialBalance === 0) {
      console.log("\n⚠️  WALLET NEEDS FUNDING")
      console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
      await page.screenshot({ path: "coinToss-needs-funding.png", fullPage: true })
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play coin toss
    console.log("\n=== PLAYING COIN TOSS ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()
    await betAmountInput.fill("0.0001")
    console.log("Bet amount: 0.0001 ETH")

    // Select heads using proper locator
    console.log("Looking for coin selection button...")
    // The coin button shows the current selection and clicking it toggles to the other side
    // If it shows "Select Tails side", then Heads is currently selected
    // If it shows "Select Heads side", then Tails is currently selected
    const coinButton = page.locator('button[aria-label*="Select"][aria-label*="side"]')
    await expect(coinButton).toBeVisible({ timeout: 5000 })

    // Check current selection
    const ariaLabel = await coinButton.getAttribute("aria-label")
    console.log("Current coin button aria-label:", ariaLabel)

    // If it says "Select Heads side", then Tails is selected, so we need to click to get Heads
    if (ariaLabel?.includes("Select Heads")) {
      await coinButton.click()
      console.log("Clicked to select Heads")
    } else {
      console.log("Heads is already selected")
    }

    // Look for the play button
    console.log("Looking for play button...")

    // Wait for the play button to be in the correct state
    const playButton = page.getByRole("button", { name: "Place Bet" })
    await expect(playButton).toBeVisible({ timeout: 10000 })
    await expect(playButton).toBeEnabled()

    // Click play button
    await playButton.click()
    console.log("Clicked Place Bet button")

    // Confirm transaction in MetaMask
    await metamask.confirmTransaction()
    console.log("Transaction confirmed in MetaMask")

    // Wait for bet to be processed through its various states
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
      await expect(loadingBetButton).toBeHidden({ timeout: 60000 })
    }

    // Finally it should show "Bet rolling..." while the bet is being resolved
    const rollingButton = page.getByRole("button", { name: "Bet rolling..." })
    const hasRollingState = await rollingButton.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasRollingState) {
      console.log("Bet is rolling...")
      await expect(rollingButton).toBeHidden({ timeout: 120000 })
    }

    console.log("Bet processing completed!")

    // Check for result - it might appear in different ways
    console.log("Checking for game result...")

    // First check if result modal appears
    const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
    const hasResultModal = await resultModal.isVisible({ timeout: 10000 }).catch(() => false)

    let isWin = false
    if (hasResultModal) {
      const resultText = await resultModal.textContent()
      isWin = resultText?.toLowerCase().includes("won") || false
      console.log(`\n🎰 RESULT FROM MODAL: ${isWin ? "WON! 🎉" : "Lost 😢"}`)

      // Close result modal using aria-label
      const resultCloseButton = resultModal.locator('button[aria-label="Close"]')
      if (await resultCloseButton.isVisible()) {
        await resultCloseButton.click()
        console.log("Result modal closed")
      }
    } else {
      // No modal found, determine result from balance change
      console.log("No result modal found, determining result from balance...")

      // Get current balance to determine win/loss
      const currentBalanceText = await balanceContainer.textContent()
      const currentBalance = extractBalance(currentBalanceText)

      // If balance increased (accounting for bet amount), player won
      // If balance decreased, player lost
      if (currentBalance > initialBalance - 0.0001) {
        isWin = true
        console.log(`\n🎰 RESULT FROM BALANCE: WON! 🎉 (${initialBalance} → ${currentBalance})`)
      } else {
        isWin = false
        console.log(`\n🎰 RESULT FROM BALANCE: Lost 😢 (${initialBalance} → ${currentBalance})`)
      }
    }

    // Close bet history if it's open
    console.log("Checking for bet history panel...")
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

    // Verify balance changed
    console.log("\n=== VERIFYING BALANCE CHANGE ===")
    const finalBalanceText = await balanceContainer.textContent()
    const finalBalance = extractBalance(finalBalanceText)
    console.log("Final balance:", finalBalance)

    // Balance should have changed (either decreased by bet amount or increased if won)
    // Allow for small rounding differences
    const balanceChanged = Math.abs(finalBalance - initialBalance) > 0.00001
    expect(balanceChanged).toBe(true)

    if (isWin) {
      // If won, balance should be higher than initial minus bet
      expect(finalBalance).toBeGreaterThan(initialBalance - 0.0001)
    } else {
      // If lost, balance should be exactly initial minus bet (accounting for gas)
      expect(finalBalance).toBeLessThan(initialBalance)
    }

    // Verify we can play again
    console.log("\n=== VERIFYING READY TO PLAY AGAIN ===")

    // First ensure bet amount input is visible
    await expect(betAmountInput).toBeVisible({ timeout: 5000 })

    // The play button should be visible and show either "Place Bet" or "Try again"
    // After a successful bet, it shows "Try again"
    const playAgainButton = page.locator(
      'button:has-text("Place Bet"), button:has-text("Try again")',
    )
    const canPlayAgain = await playAgainButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (canPlayAgain) {
      console.log("Play button is ready for another bet")
    } else {
      // If play button not found, take screenshot for debugging
      await page.screenshot({ path: "coinToss-cannot-play-again.png", fullPage: true })
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

    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Coin toss game test completed successfully!")
    console.log(`Balance change: ${initialBalance} ETH → ${finalBalance} ETH`)
  })
})
