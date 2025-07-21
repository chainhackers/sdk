import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe("Chain Token List Tests", () => {
  test("should update token list when switching chains", async ({
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

    // Test 1: Check tokens on current network (may be Base or Polygon)
    console.log("\n=== CHECKING INITIAL TOKENS ===")

    // Click to open the chain/token selector
    const tokenSelector = page
      .locator("button")
      .filter({ hasText: /ETH|DEGEN|POL|Select.*token/i })
      .first()
    await tokenSelector.click()
    await page.waitForTimeout(1000)

    // Get initial tokens
    const initialTokens = await page.locator('[role="option"]').allTextContents()
    console.log("Initial tokens:", initialTokens)

    // Determine which network we're on
    const hasETH = initialTokens.some((token) => token.includes("ETH"))
    const hasPOL = initialTokens.some((token) => token.includes("POL"))
    const startingOnBase = hasETH && !hasPOL
    const startingOnPolygon = hasPOL && !hasETH

    console.log(`Starting on Base: ${startingOnBase}`)
    console.log(`Starting on Polygon: ${startingOnPolygon}`)

    // Close the popup
    await page.keyboard.press("Escape")
    await page.waitForTimeout(1000)

    // Test 2: Switch networks and verify token lists change
    if (startingOnBase) {
      // Switch to Polygon
      console.log("\n=== SWITCHING TO POLYGON ===")
      await metamask.switchNetwork("Polygon")
      await page.waitForTimeout(3000)

      // Reload to ensure network change is reflected
      await page.reload()
      await page.waitForLoadState("networkidle")

      // Open token selector
      const tokenSelectorPolygon = page
        .locator("button")
        .filter({ hasText: /POL|ETH|Select.*token/i })
        .first()
      await tokenSelectorPolygon.click()
      await page.waitForTimeout(1000)

      // Get Polygon tokens
      const polygonTokens = await page.locator('[role="option"]').allTextContents()
      console.log("Polygon tokens:", polygonTokens)

      // Verify Polygon has POL
      const hasPOLOnPolygon = polygonTokens.some((token) => token.includes("POL"))
      expect(hasPOLOnPolygon).toBe(true)

      // Close popup
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1000)

      // Switch back to Base
      console.log("\n=== SWITCHING BACK TO BASE ===")
      await metamask.switchNetwork("Base")
      await page.waitForTimeout(3000)

      // Reload
      await page.reload()
      await page.waitForLoadState("networkidle")

      // Open token selector
      const tokenSelectorBase = page
        .locator("button")
        .filter({ hasText: /ETH|POL|Select.*token/i })
        .first()
      await tokenSelectorBase.click()
      await page.waitForTimeout(1000)

      // Get Base tokens
      const baseTokens = await page.locator('[role="option"]').allTextContents()
      console.log("Base tokens:", baseTokens)

      // Verify Base has ETH
      const hasETHOnBase = baseTokens.some((token) => token.includes("ETH"))
      expect(hasETHOnBase).toBe(true)
    } else if (startingOnPolygon) {
      // Switch to Base
      console.log("\n=== SWITCHING TO BASE ===")
      await metamask.switchNetwork("Base")
      await page.waitForTimeout(3000)

      // Reload to ensure network change is reflected
      await page.reload()
      await page.waitForLoadState("networkidle")

      // Open token selector
      const tokenSelectorBase = page
        .locator("button")
        .filter({ hasText: /ETH|POL|Select.*token/i })
        .first()
      await tokenSelectorBase.click()
      await page.waitForTimeout(1000)

      // Get Base tokens
      const baseTokens = await page.locator('[role="option"]').allTextContents()
      console.log("Base tokens:", baseTokens)

      // Verify Base has ETH
      const hasETHOnBase = baseTokens.some((token) => token.includes("ETH"))
      expect(hasETHOnBase).toBe(true)

      // Close popup
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1000)

      // Switch back to Polygon
      console.log("\n=== SWITCHING BACK TO POLYGON ===")
      await metamask.switchNetwork("Polygon")
      await page.waitForTimeout(3000)

      // Reload
      await page.reload()
      await page.waitForLoadState("networkidle")

      // Open token selector
      const tokenSelectorPolygon = page
        .locator("button")
        .filter({ hasText: /POL|ETH|Select.*token/i })
        .first()
      await tokenSelectorPolygon.click()
      await page.waitForTimeout(1000)

      // Get Polygon tokens
      const polygonTokens = await page.locator('[role="option"]').allTextContents()
      console.log("Polygon tokens:", polygonTokens)

      // Verify Polygon has POL
      const hasPOLOnPolygon = polygonTokens.some((token) => token.includes("POL"))
      expect(hasPOLOnPolygon).toBe(true)
    }

    // Take a screenshot of the final state
    await page.screenshot({ path: "chain-token-list-final.png", fullPage: true })

    console.log("\n✅ Chain token list test completed!")
    console.log("Token lists update correctly when switching between Base and Polygon")
  })
})
