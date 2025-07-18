import { testWithSynpress } from "@synthetixio/synpress"
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright"
import basicSetup from "../test/wallet-setup/basic.setup"

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test("display wallet address for funding", async ({ context, metamaskPage, extensionId }) => {
  const metamask = new MetaMask(context, metamaskPage, extensionId)
  const address = await metamask.getAccountAddress()

  console.log("\n========================================")
  console.log("🎮 BETSWIRL E2E TEST WALLET INFO")
  console.log("========================================")
  console.log("Wallet Address:", address)
  console.log("\n📋 REQUIRED FUNDING FOR E2E TESTS:")
  console.log("\nBase Chain (Chain ID: 8453):")
  console.log("- Send 0.001 ETH to:", address)
  console.log("\nPolygon Chain (Chain ID: 137):")
  console.log("- Send 0.1 POL to:", address)
  console.log("\nAvalanche Chain (Chain ID: 43114):")
  console.log("- Send 0.01 AVAX to:", address)
  console.log("\n💡 Optional for ERC20 tests on Base:")
  console.log("- DEGEN: 10 tokens (0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed)")
  console.log("- USDC: 10 tokens")
  console.log("========================================\n")

  // Just verify MetaMask is working
  expect(address).toBeDefined()
  expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
})
