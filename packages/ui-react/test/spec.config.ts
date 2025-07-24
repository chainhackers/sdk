import "dotenv/config"

export interface TestConfig {
  seedPhrase: string
  walletPassword: string
}

if (!process.env.SEED_PHRASE || !process.env.WALLET_PASSWORD) {
  throw new Error(
    "SEED_PHRASE and WALLET_PASSWORD must be set in environment variables for E2E tests",
  )
}

export const testConfig: TestConfig = {
  seedPhrase:
    process.env.SEED_PHRASE || "test test test test test test test test test test test junk",
  walletPassword: process.env.WALLET_PASSWORD || "Tester@1234",
}
