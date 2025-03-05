# BetSwirl SDKs

## General
### Networks
- **Arbitrum**
- **Avalanche**
- **Base**
- **Binance Smart Chain**
- **Polygon**
- Arbitrum Sepolia
- Avalanche Fuji
- Base Sepolia
- Binance Smart Chain Testnet
- Polygon Amoy

### Deployed contracts

All our mainnets contracts have the same address on each network:

- **Bank** `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA`
- **CoinToss** `0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3`
- **Dice** `0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f`
- **Roulette** `0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb`
- **Keno** `0xc3428E4FEb5C770Db51DCb9B1C08223B10994a89`

=> You can find more info and the deployed testnet contracts [here](https://github.com/BetSwirl/sdk/blob/main/packages/core/src/data/casino.ts)
  
### Subgraphs
- **[Arbitrum](https://thegraph.com/explorer/subgraphs/AsPBS4ymrjoR61r1x2avNJJtMPvzZ3quMHxvQTgDJbU?view=Query&chain=arbitrum-one)**
- **[Avalanche](https://thegraph.com/explorer/subgraphs/4nQJ4T5TXvTxgECqQ6ox6Nwf57d5BNt6SCn7CzzxjDZN?view=Query&chain=arbitrum-one)**
- **[Base](https://thegraph.com/explorer/subgraphs/6rt22DL9aaAjJHDUZ25sSsPuvuKxp1Tnf8LBXhL8WdZi?view=Query&chain=arbitrum-one)**
- **[Binance Smart Chain](https://thegraph.com/explorer/subgraphs/69xMkatN58qWXZS7FXqiVQmvkHhNrq3thTfdB6t85Wvk?view=Query&chain=arbitrum-one)**
- **[Polygon](https://thegraph.com/explorer/subgraphs/FL3ePDCBbShPvfRJTaSCNnehiqxsPHzpLud6CpbHoeKW?view=Query&chain=arbitrum-one)**

=> You can find more info and the testnet subgraph query urls [here](https://github.com/BetSwirl/sdk/blob/main/packages/core/src/data/casino.ts)
  
### Audits

**[Paladin](https://paladinsec.co/)** is our main auditor and has done 3 audits:
- 07/2024 Bank & Casino games
- 10/2024 PvP games & Wheel game
- 11/2024 Leaderboard & Freebet

=> Consult the audit results [here](https://paladinsec.co/projects/betswirl/)

## Contribution

### Installation

```bash
pnpm install
```
### Local changes

If you updated a package and you want to see the changes in the other packages, then run this command in the updated package:

```bash
pnpm run build
```

=> The dependencies of the other packages will automatically be updated with the new version.

### Publishing

```bash
pnpm change:version
pnpm change:publish
```
