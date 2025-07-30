import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test("check wallet balance and display funding info", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // Connect wallet
  const connectButton = page.getByTestId("ockConnectButton")
  await expect(connectButton).toBeVisible()
  await connectButton.click()

  const onchainkitModal = page.locator('[data-testid="ockModalOverlay"]')
  await expect(onchainkitModal).toBeVisible()
  const metamaskBtn = onchainkitModal.getByRole("button").filter({ hasText: /metamask/i })
  await metamaskBtn.click()

  await metamask.connectToDapp()
  const address = await metamask.getAccountAddress()

  const walletConnectedBtn = page.locator('[data-testid="ockConnectWallet_Connected"]')
  await expect(walletConnectedBtn).toBeVisible({ timeout: 10000 })

  // Wait for app to load
  await page.waitForTimeout(3000)

  // Get balance info - look for the balance button next to the "Balance:" span
  const balanceSection = page.locator("text=Balance:").locator("..")
  await expect(balanceSection).toBeVisible({ timeout: 30000 })

  const balanceButton = balanceSection.locator("button").first()
  await expect(balanceButton).toBeVisible()

  const balanceText = await balanceButton.textContent()

  console.log("\n========================================")
  console.log("🎮 BETSWIRL E2E TEST WALLET INFO")
  console.log("========================================")
  console.log("Wallet Address:", address)
  console.log("Current Balance:", balanceText)
  console.log("\n📋 REQUIRED FUNDING:")
  console.log("- Base Chain: 0.001 ETH")
  console.log("- Polygon Chain: 0.1 POL")
  console.log("- Avalanche Chain: 0.01 AVAX")
  console.log("\n💡 Optional for ERC20 tests:")
  console.log("- Base: 10 DEGEN tokens")
  console.log("- Base: 10 USDC tokens")
  console.log("========================================\n")

  // Open chain selector to see all chains
  await balanceButton.click()
  const chainSheet = page.locator('[role="dialog"]').filter({ hasText: /Select Chain/i })
  await expect(chainSheet).toBeVisible({ timeout: 5000 })

  const chainButtons = chainSheet.locator("button[data-chain-id]")
  const chainCount = await chainButtons.count()

  console.log("Available chains:")
  for (let i = 0; i < chainCount; i++) {
    const chainButton = chainButtons.nth(i)
    const chainText = await chainButton.textContent()
    console.log(`- ${chainText}`)
  }
})
