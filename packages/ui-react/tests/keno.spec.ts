import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe("Keno Game", () => {
  test("should play keno with ETH on Base chain", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

    // Navigate to keno game
    await page.goto("/keno.html")
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

    // Wait for app to initialize and potentially handle network switch
    await page.waitForTimeout(3000)

    // Check if we need to switch to Base network
    const switchNetworkButton = page.locator('button:has-text("Switch network")')
    if (await switchNetworkButton.isVisible({ timeout: 5000 })) {
      console.log("Switching to Base network...")
      await switchNetworkButton.click()

      // Handle MetaMask network switch approval
      await metamask.approveSwitchNetwork()
      await page.waitForTimeout(2000)
    }

    // Check current balance and chain
    console.log("\n=== CHECKING WALLET STATUS ===")
    const balanceButton = page.locator('button:has-text("Balance:")').first()
    await expect(balanceButton).toBeVisible({ timeout: 20000 })

    const balanceText = await balanceButton.textContent()
    console.log("Balance:", balanceText)

    // Check if wallet has sufficient balance
    if (balanceText?.includes("0 ETH") || balanceText === "Balance: 0 ETH") {
      console.log("\n⚠️  WALLET NEEDS FUNDING")
      console.log(`Please send at least 0.001 ETH to ${address} on Base chain`)
      throw new Error("Test wallet needs 0.001 ETH on Base chain to continue")
    }

    // Play keno
    console.log("\n=== PLAYING KENO ===")

    // Enter bet amount
    const betAmountInput = page.locator("#betAmount")
    await expect(betAmountInput).toBeVisible()
    await betAmountInput.fill("0.0001")
    console.log("Bet amount: 0.0001 ETH")

    // Select 5 numbers
    const selectedNumbers = []
    for (let i = 1; i <= 5; i++) {
      const numberButton = page.locator(`button[aria-label*="${i * 10}"]`).first()
      await numberButton.click()
      selectedNumbers.push(i * 10)
      await page.waitForTimeout(200) // Small delay between selections
    }
    console.log("Selected numbers:", selectedNumbers.join(", "))

    // Place bet
    const playButton = page.locator("button").filter({ hasText: "Place Bet" }).first()
    await expect(playButton).toBeVisible()
    await expect(playButton).toBeEnabled()
    await playButton.click()
    console.log("Placing bet...")

    // Confirm transaction in MetaMask
    await metamask.confirmTransaction()
    console.log("Transaction confirmed in MetaMask")

    // Wait for bet to be processed
    await expect(playButton).toHaveText(/Bet rolling|Loading/i, { timeout: 30000 })
    console.log("Bet is being processed...")

    // Wait for result (max 2 minutes)
    await expect(playButton).not.toHaveText(/rolling|loading/i, { timeout: 120000 })
    console.log("Bet completed!")

    // Check result
    const resultModal = page.locator('[role="dialog"]').filter({ hasText: /You (won|lost)/i })
    const resultVisible = await resultModal.isVisible()

    if (resultVisible) {
      const resultText = await resultModal.textContent()
      const isWin = resultText?.toLowerCase().includes("won")
      console.log(`\n🎱 RESULT: ${isWin ? "WON! 🎉" : "Lost 😢"}`)

      // Close result modal
      const closeButton = resultModal
        .locator('button[aria-label="Close"]')
        .or(resultModal.locator('button:has-text("Close")'))
      if (await closeButton.isVisible()) {
        await closeButton.click()
        console.log("Result modal closed")
      }
    }

    // Verify we can play again
    await expect(playButton).toHaveText("Place Bet")
    console.log("\n✅ Keno game test completed successfully!")
  })
})
