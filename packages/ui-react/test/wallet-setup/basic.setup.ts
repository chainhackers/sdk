// Import necessary Synpress modules
import { defineWalletSetup } from "@synthetixio/synpress"
import { MetaMask } from "@synthetixio/synpress/playwright"
import { config } from "../../app.config"

const SEED_PHRASE = config.test.seedPhrase
const PASSWORD = config.test.walletPassword

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE)

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
})
