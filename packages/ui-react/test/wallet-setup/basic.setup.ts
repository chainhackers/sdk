// Import necessary Synpress modules

import fs from "node:fs"
import path from "node:path"
import { defineWalletSetup } from "@synthetixio/synpress"
import { MetaMask } from "@synthetixio/synpress/playwright"
import { config } from "../../app.config"

// Try to read from .secrets file first, fallback to config
function getCredentials() {
  try {
    const secretsPath = path.resolve(process.cwd(), "../../.secrets")
    if (fs.existsSync(secretsPath)) {
      const secretsContent = fs.readFileSync(secretsPath, "utf8")
      const seedMatch = secretsContent.match(/SEED_PHRASE='([^']+)'/)
      const passwordMatch = secretsContent.match(/WALLET_PASSWORD='([^']+)'/)

      if (seedMatch && passwordMatch) {
        console.log("Using credentials from .secrets file")
        return {
          seedPhrase: seedMatch[1],
          password: passwordMatch[1],
        }
      }
    }
  } catch (_error) {
    // Ignore errors and use fallback
  }

  console.log("Using default test credentials")
  return {
    seedPhrase: config.test.seedPhrase,
    password: config.test.walletPassword,
  }
}

const { seedPhrase: SEED_PHRASE, password: PASSWORD } = getCredentials()

// Define the basic wallet setup
const basicSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE)

  // Add Base network with proper configuration
  try {
    await metamask.addNetwork({
      name: "Base",
      rpcUrl: "https://mainnet.base.org",
      chainId: 8453,
      symbol: "ETH",
      blockExplorerUrl: "https://basescan.org",
    })
    console.log("Base network added successfully")
  } catch (error) {
    console.log("Base network might already exist:", error)
  }

  // Add Polygon network
  try {
    await metamask.addNetwork({
      name: "Polygon",
      rpcUrl: "https://polygon-rpc.com",
      chainId: 137,
      symbol: "MATIC",
      blockExplorerUrl: "https://polygonscan.com",
    })
    console.log("Polygon network added successfully")
  } catch (error) {
    console.log("Polygon network might already exist:", error)
  }

  // Add Avalanche network
  try {
    await metamask.addNetwork({
      name: "Avalanche",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      symbol: "AVAX",
      blockExplorerUrl: "https://snowtrace.io",
    })
    console.log("Avalanche network added successfully")
  } catch (error) {
    console.log("Avalanche network might already exist:", error)
  }

  // Switch to Base network as default
  try {
    await metamask.switchNetwork("Base")
    console.log("Switched to Base network")
  } catch (error) {
    console.log("Error switching to Base network:", error)
  }
})

// Export with walletPassword property for tests to access
export default Object.assign(basicSetup, { walletPassword: PASSWORD })
