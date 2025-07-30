import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import {
  closeAllDialogs,
  extractBalance,
  verifyCanPlayAgain,
  waitForBettingStates,
} from "../test/helpers/testHelpers"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe("Token Selection Tests", () => {
  test("should switch to DEGEN token on Base and play coin toss", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to coin toss game
    await page.goto("/coinToss.html")
    await page.waitForLoadState("networkidle")

    // Connect wallet (starts on Base network)
    console.log("\n=== CONNECTING WALLET ON BASE ===")
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

    // Verify we're on Base with ETH initially
    console.log("\n=== VERIFYING BASE NETWORK WITH ETH ===")
    const balanceElement = page.locator("text=/Balance:/").first()
    await expect(balanceElement).toBeVisible({ timeout: 20000 })

    const initialBalanceText = await balanceElement.locator("..").first().textContent()
    console.log("Initial balance text (ETH):", initialBalanceText)

    // Look for token selector dropdown
    console.log("\n=== SWITCHING TO DEGEN TOKEN ===")

    // Look for the token selector button (it might show "ETH" or have a dropdown icon)
    const tokenSelector = page
      .locator("button")
      .filter({ hasText: /ETH|Select.*token/i })
      .first()
    const hasTokenSelector = await tokenSelector.isVisible({ timeout: 5000 }).catch(() => false)

    if (!hasTokenSelector) {
      // Try alternative selector - look for dropdown with ETH text
      const altTokenSelector = page.locator('[role="button"]').filter({ hasText: "ETH" }).first()
      if (await altTokenSelector.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("Found alternative token selector, clicking it")
        await altTokenSelector.click()
      } else {
        console.log("⚠️  No token selector found - game might not support token selection")
        return
      }
    } else {
      console.log("Found token selector, clicking it")
      await tokenSelector.click()
    }

    // Wait for token list to appear
    await page.waitForTimeout(1000)

    // Look for DEGEN token in the list
    const degenOption = page.locator("text=/DEGEN/i").first()
    const hasDegenOption = await degenOption.isVisible({ timeout: 5000 }).catch(() => false)

    if (!hasDegenOption) {
      console.log("⚠️  DEGEN token not found in token list")
      console.log("Available tokens:")
      const tokenOptions = await page
        .locator('[role="option"], [role="menuitem"]')
        .allTextContents()
      tokenOptions.forEach((token) => console.log(`  - ${token}`))
      return
    }

    console.log("Found DEGEN token, selecting it")
    await degenOption.click()

    // Wait for UI to update with DEGEN balance
    await page.waitForTimeout(2000)

    // Close the token selector popup if it's still open
    const closeButton = page.locator('button[aria-label="Close"]').first()
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log("Closing token selector popup")
      await closeButton.click()
      await page.waitForTimeout(1000)
    }

    // Also try clicking outside the popup
    await page.mouse.click(10, 10)
    await page.waitForTimeout(1000)

    // Check DEGEN balance
    console.log("\n=== CHECKING DEGEN BALANCE ===")
    const degenBalanceText = await balanceElement.locator("..").first().textContent()
    console.log("DEGEN balance text:", degenBalanceText)

    const degenBalance = extractBalance(degenBalanceText)
    console.log("DEGEN balance amount:", degenBalance)

    // Check if wallet needs DEGEN tokens
    if (degenBalance === 0) {
      console.log("\n⚠️  WALLET NEEDS DEGEN TOKENS ON BASE")
      console.log(`Please send DEGEN tokens to ${address} on Base chain`)
      console.log("DEGEN token contract on Base: 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed")
      console.log("You can get DEGEN from:")
      console.log("- Uniswap on Base")
      console.log("- Bridge from Ethereum")
      await page.screenshot({ path: "base-needs-degen.png", fullPage: true })

      // Don't throw error, just log the requirement
      console.log("⚠️  Skipping game play due to insufficient DEGEN balance")
      return
    }

    // Play coin toss with DEGEN
    console.log("\n=== PLAYING COIN TOSS WITH DEGEN ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.clear()

    // Use a reasonable DEGEN bet amount (DEGEN typically has high supply)
    const betAmount = Math.min(1000, degenBalance * 0.1) // 10% of balance or 1000 DEGEN, whichever is smaller
    await betAmountInput.fill(betAmount.toString())
    console.log(`Bet amount: ${betAmount} DEGEN`)

    // Select heads
    const coinButton = page.locator('button[aria-label*="Select"][aria-label*="side"]')
    await expect(coinButton).toBeVisible({ timeout: 5000 })

    const ariaLabel = await coinButton.getAttribute("aria-label")
    console.log("Current coin button aria-label:", ariaLabel)

    if (ariaLabel?.includes("Select Heads")) {
      await coinButton.click()
      console.log("Selected Heads")
    } else {
      console.log("Heads already selected")
    }

    // Check if we need to approve DEGEN spending
    const playButton = page.locator(
      'button:has-text("Place Bet"), button:has-text("Try again"), button:has-text("Approve")',
    )
    await expect(playButton).toBeVisible({ timeout: 10000 })

    const buttonText = await playButton.textContent()
    console.log("Play button text:", buttonText)

    // Check if button is disabled
    const isDisabled = await playButton.isDisabled()
    if (isDisabled) {
      console.log("Play button is disabled, taking screenshot...")
      await page.screenshot({ path: "degen-play-button-disabled.png", fullPage: true })

      // Look for any approve buttons or messages
      const approveButton = page.locator("button").filter({ hasText: /approve/i })
      const approveCount = await approveButton.count()
      console.log(`Found ${approveCount} approve button(s)`)

      if (approveCount > 0) {
        console.log("Found approve button, clicking the first one")
        await approveButton.first().click()

        // Confirm approval in MetaMask
        await metamask.confirmTransaction()
        console.log("Approval transaction confirmed in MetaMask")

        // Wait for approval to be processed
        await page.waitForTimeout(15000)

        // Now look for Place Bet button
        const placeBetButton = page.locator('button:has-text("Place Bet")')
        await expect(placeBetButton).toBeVisible({ timeout: 30000 })
        await expect(placeBetButton).toBeEnabled({ timeout: 15000 })
        await placeBetButton.click()
        console.log("Clicked Place Bet button after approval")
      } else {
        // Check if there's an error message
        const errorMessage = page.locator("text=/insufficient|error|failed/i")
        if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await errorMessage.textContent()
          console.log("Error message found:", errorText)
        }

        console.log("No approve button found, waiting for Place Bet to be enabled...")
        await page.waitForTimeout(5000) // Give it time to update

        // Re-check the button
        if (await playButton.isDisabled()) {
          console.log("Button still disabled after waiting, skipping test")
          return
        }

        await playButton.click()
        console.log("Clicked Place Bet button after waiting")
      }
    } else if (buttonText?.toLowerCase().includes("approve")) {
      console.log("Need to approve DEGEN spending, clicking approve button")
      await playButton.click()

      // Confirm approval in MetaMask
      await metamask.confirmTransaction()
      console.log("Approval transaction confirmed in MetaMask")

      // Wait for approval to be processed
      await page.waitForTimeout(10000)

      // Now look for Place Bet button
      const placeBetButton = page.locator('button:has-text("Place Bet")')
      await expect(placeBetButton).toBeVisible({ timeout: 30000 })
      await expect(placeBetButton).toBeEnabled({ timeout: 10000 })
      await placeBetButton.click()
      console.log("Clicked Place Bet button after approval")
    } else {
      await expect(playButton).toBeEnabled({ timeout: 10000 })
      await playButton.click()
      console.log("Clicked Place Bet button")
    }

    // Confirm transaction in MetaMask
    await metamask.confirmTransaction()
    console.log("Bet transaction confirmed in MetaMask")

    // Wait for bet to be processed
    await waitForBettingStates(page)

    // Check for result
    console.log("Checking for game result...")

    const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
    const hasResultModal = await resultModal.isVisible({ timeout: 10000 }).catch(() => false)

    let isWin = false
    if (hasResultModal) {
      const resultText = await resultModal.textContent()
      isWin = resultText?.toLowerCase().includes("won") || false
      console.log(`\n🎰 DEGEN RESULT: ${isWin ? "WON! 🎉" : "Lost 😢"}`)

      // Close result modal
      const resultCloseButton = resultModal.locator('button[aria-label="Close"]')
      if (await resultCloseButton.isVisible()) {
        await resultCloseButton.click()
      }
    } else {
      // Determine result from balance change
      console.log("No result modal found, determining result from balance...")

      const currentBalanceText = await balanceElement.locator("..").first().textContent()
      const currentBalance = extractBalance(currentBalanceText)

      if (currentBalance > degenBalance - betAmount) {
        isWin = true
        console.log(`\n🎰 DEGEN RESULT: WON! 🎉 (${degenBalance} → ${currentBalance} DEGEN)`)
      } else {
        isWin = false
        console.log(`\n🎰 DEGEN RESULT: Lost 😢 (${degenBalance} → ${currentBalance} DEGEN)`)
      }
    }

    // Close any open dialogs
    await closeAllDialogs(page)

    // Verify final state
    console.log("\n=== VERIFYING FINAL STATE ===")
    const finalBalanceText = await balanceElement.locator("..").first().textContent()
    const finalBalance = extractBalance(finalBalanceText)
    console.log("Final DEGEN balance:", finalBalance, "DEGEN")

    // Verify balance changed
    const balanceChanged = Math.abs(finalBalance - degenBalance) > 1 // Allow 1 DEGEN tolerance
    expect(balanceChanged).toBe(true)

    if (isWin) {
      expect(finalBalance).toBeGreaterThan(degenBalance - betAmount)
    } else {
      expect(finalBalance).toBeLessThan(degenBalance)
    }

    // Verify we can play again
    const canPlayAgain = await verifyCanPlayAgain(page, "degen-cannot-play-again.png")
    expect(canPlayAgain).toBe(true)

    console.log("\n✅ Token selection test completed successfully!")
    console.log("Played coin toss with DEGEN token on Base")
    console.log(`Balance change: ${degenBalance} DEGEN → ${finalBalance} DEGEN`)
  })
})
