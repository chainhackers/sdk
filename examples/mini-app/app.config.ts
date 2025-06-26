import 'dotenv/config'

const port = Number(process.env.PORT) || 5173

export const config = {
  port,
  baseUrl: `http://localhost:${port}`,
  test: {
    seedPhrase: process.env.SEED_PHRASE || 'test test test test test test test test test test test junk',
    walletPassword: process.env.WALLET_PASSWORD || 'Tester@1234',
  },
}
