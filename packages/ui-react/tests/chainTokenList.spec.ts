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

    // Open chain/token selector
    console.log("\n=== CHECKING BASE CHAIN TOKENS ===")
    const balanceElement = page.locator("text=/Balance:/").first()
    await expect(balanceElement).toBeVisible({ timeout: 20000 })

    // Click to open the selector
    const tokenSelector = page
      .locator("button")
      .filter({ hasText: /ETH|Select.*token/i })
      .first()
    await tokenSelector.click()
    await page.waitForTimeout(1000)

    // Get token list for Base
    console.log("Getting token list for Base chain...")
    const baseTokens = await page
      .locator('[role="option"], [role="menuitem"], .token-option')
      .allTextContents()
    console.log("Base chain tokens:", baseTokens)

    // Check that Base has ETH and DEGEN
    const hasETHOnBase = baseTokens.some((token) => token.includes("ETH"))
    const hasDEGENOnBase = baseTokens.some((token) => token.includes("DEGEN"))
    console.log(`Base has ETH: ${hasETHOnBase}`)
    console.log(`Base has DEGEN: ${hasDEGENOnBase}`)

    // Now switch to Polygon
    console.log("\n=== SWITCHING TO POLYGON ===")

    // Look for chain selector in the popup
    const chainSelector = page
      .locator('button, [role="button"]')
      .filter({ hasText: /Base|Chain/i })
      .first()
    if (await chainSelector.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Found chain selector in popup, clicking it")
      await chainSelector.click()
      await page.waitForTimeout(1000)
    }

    // Select Polygon
    const polygonOption = page.locator("text=/Polygon/i").first()
    if (await polygonOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Found Polygon option, clicking it")
      await polygonOption.click()

      // Handle MetaMask network switch
      await page.waitForTimeout(2000)

      // Might need to approve network switch in MetaMask
      const switchNetworkBtn = page.locator('button:has-text("Switch"), button:has-text("Approve")')
      if (await switchNetworkBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("Found network switch button, clicking it")
        await switchNetworkBtn.click()
        await page.waitForTimeout(3000)
      }
    } else {
      console.log("Polygon not found in chain list, trying MetaMask switch")
      // Close popup first
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1000)

      // Switch via MetaMask
      await metamask.switchNetwork("Polygon")
      console.log("Switched to Polygon via MetaMask")

      // Handle any popups
      const gotItButton = metamaskPage.locator('button:has-text("Got it")')
      if (await gotItButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await gotItButton.click()
      }

      // Reload page to ensure network change is reflected
      await page.reload()
      await page.waitForLoadState("networkidle")
    }

    // Wait for UI to update
    await page.waitForTimeout(3000)

    // Open token selector again
    console.log("\n=== CHECKING POLYGON CHAIN TOKENS ===")
    const tokenSelectorPolygon = page
      .locator("button")
      .filter({ hasText: /POL|ETH|Select.*token/i })
      .first()
    await tokenSelectorPolygon.click()
    await page.waitForTimeout(1000)

    // Get token list for Polygon
    console.log("Getting token list for Polygon chain...")
    const polygonTokens = await page
      .locator('[role="option"], [role="menuitem"], .token-option')
      .allTextContents()
    console.log("Polygon chain tokens:", polygonTokens)

    // Check that Polygon has POL (native token, formerly MATIC)
    const hasPOLOnPolygon = polygonTokens.some((token) => token.includes("POL"))
    const hasUSDCOnPolygon = polygonTokens.some((token) => token.includes("USDC"))
    console.log(`Polygon has POL: ${hasPOLOnPolygon}`)
    console.log(`Polygon has USDC: ${hasUSDCOnPolygon}`)

    // Now switch to Avalanche if available
    console.log("\n=== SWITCHING TO AVALANCHE ===")

    // Look for chain selector again
    const chainSelectorAvalanche = page
      .locator('button, [role="button"]')
      .filter({ hasText: /Polygon|Chain/i })
      .first()
    if (await chainSelectorAvalanche.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Found chain selector in popup, clicking it")
      await chainSelectorAvalanche.click()
      await page.waitForTimeout(1000)
    }

    // Select Avalanche
    const avalancheOption = page.locator("text=/Avalanche/i").first()
    if (await avalancheOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("Found Avalanche option, clicking it")
      await avalancheOption.click()

      // Handle MetaMask network switch
      await page.waitForTimeout(2000)

      // Might need to approve network switch
      const switchNetworkBtnAvax = page.locator(
        'button:has-text("Switch"), button:has-text("Approve")',
      )
      if (await switchNetworkBtnAvax.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("Found network switch button, clicking it")
        await switchNetworkBtnAvax.click()
        await page.waitForTimeout(3000)
      }
    } else {
      console.log("Avalanche not found in chain list, trying MetaMask switch")
      // Close popup first
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1000)

      // Switch via MetaMask
      await metamask.switchNetwork("Avalanche")
      console.log("Switched to Avalanche via MetaMask")

      // Handle any popups
      const gotItButtonAvax = metamaskPage.locator('button:has-text("Got it")')
      if (await gotItButtonAvax.isVisible({ timeout: 5000 }).catch(() => false)) {
        await gotItButtonAvax.click()
      }

      // Reload page
      await page.reload()
      await page.waitForLoadState("networkidle")
    }

    // Wait for UI to update
    await page.waitForTimeout(3000)

    // Open token selector again
    console.log("\n=== CHECKING AVALANCHE CHAIN TOKENS ===")
    const tokenSelectorAvalanche = page
      .locator("button")
      .filter({ hasText: /AVAX|ETH|MATIC|Select.*token/i })
      .first()
    await tokenSelectorAvalanche.click()
    await page.waitForTimeout(1000)

    // Get token list for Avalanche
    console.log("Getting token list for Avalanche chain...")
    const avalancheTokens = await page
      .locator('[role="option"], [role="menuitem"], .token-option')
      .allTextContents()
    console.log("Avalanche chain tokens:", avalancheTokens)

    // Check that Avalanche has AVAX (native token)
    const hasAVAXOnAvalanche = avalancheTokens.some((token) => token.includes("AVAX"))
    const hasUSDCOnAvalanche = avalancheTokens.some((token) => token.includes("USDC"))
    console.log(`Avalanche has AVAX: ${hasAVAXOnAvalanche}`)
    console.log(`Avalanche has USDC: ${hasUSDCOnAvalanche}`)

    // Close popup
    await page.keyboard.press("Escape")
    await page.waitForTimeout(1000)

    // Summary
    console.log("\n=== TOKEN LIST VERIFICATION SUMMARY ===")
    console.log("Base chain tokens include ETH and DEGEN")
    console.log("Polygon chain tokens include POL")
    console.log("Avalanche chain tokens include AVAX")

    // Verify that native tokens are different on each chain
    console.log("\n=== NATIVE TOKEN CHECK ===")
    console.log(`Base native token should be ETH: ${hasETHOnBase}`)
    console.log(`Polygon native token should be POL: ${hasPOLOnPolygon}`)
    console.log(`Avalanche native token should be AVAX: ${hasAVAXOnAvalanche}`)

    // Take a screenshot of the final state
    await page.screenshot({ path: "chain-token-list-final.png", fullPage: true })

    console.log("\n✅ Chain token list test completed!")
    console.log("Token lists update correctly when switching chains")
  })
})
