# How to Check Available Tokens

This guide explains how to find which tokens are available for betting in the BetSwirl protocol on different blockchain networks.

> **Note:** Currently, this library only supports **Base network**. Multi-chain support is coming soon.

## Bank Contract Addresses

The Bank contract manages all available tokens. Here are the addresses by network:

### Mainnet Networks (Same Address)
All mainnet networks use the same Bank contract address: `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA`

- **Base** (8453): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://basescan.org/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Arbitrum** (42161): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://arbiscan.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Polygon** (137): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://polygonscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **Avalanche** (43114): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://snowtrace.io/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)
- **BSC** (56): [0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA](https://bscscan.com/address/0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA#readContract)

### Testnet Networks (Different Addresses)
Each testnet has its own Bank contract:
- **Base Sepolia** (84532): [0x637D401554875a330264e910A3778DAf549F2021](https://sepolia.basescan.org/address/0x637D401554875a330264e910A3778DAf549F2021#readContract)
- **Arbitrum Sepolia** (421614): [0x3ca54e047aE5f9141b49c6817aa7994CDc589d19](https://sepolia.arbiscan.io/address/0x3ca54e047aE5f9141b49c6817aa7994CDc589d19#readContract)
- **Avalanche Fuji** (43113): [0x25bED5A341218Df801a64951d02d3c968E84a6d4](https://testnet.snowtrace.io/address/0x25bED5A341218Df801a64951d02d3c968E84a6d4#readContract)
- **Polygon Amoy** (80002): [0x89D47048152581633579450DC4888C931CD4c28C](https://amoy.polygonscan.com/address/0x89D47048152581633579450DC4888C931CD4c28C#readContract)

## Step-by-Step Guide to Check Tokens

### 1. Open the Block Explorer

For Base network (currently the only supported network):
- **Base**: https://basescan.org

For other networks (when multi-chain support is added):
- **Arbitrum**: https://arbiscan.io
- **Polygon**: https://polygonscan.com
- **Avalanche**: https://snowtrace.io
- **BSC**: https://bscscan.com

### 2. Navigate to the Bank Contract

1. Paste the Bank contract address in the search bar
2. Click on the address to open the contract page
3. Click on the **"Contract"** tab
4. Click on **"Read Contract"** (not Write Contract)

### 3. Find and Call getTokens()

1. Look for the function called **`getTokens`** in the list
2. Click on it to expand
3. Click the **"Query"** button (no wallet connection needed)

### 4. Understanding the Response

You'll get an array of tuples. Each tuple represents a token with this structure:

```
[decimals, address, name, symbol, allowed, paused, balanceRisk, ...]
```

Example response from Base:
```
[
  [18, 0x0000000000000000000000000000000000000000, "ETH", "ETH", true, false, 200, ...],
  [18, 0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed, "Degen", "DEGEN", true, false, 1000, ...],
  [6, 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, "USD Coin", "USDC", true, false, 200, ...]
]
```

### Field Explanation

| Index | Field | Description |
|-------|-------|-------------|
| 0 | decimals | Token decimals (18 for most, 6 for USDC) |
| 1 | address | Token contract address |
| 2 | name | Full token name |
| 3 | symbol | Token symbol |
| 4 | allowed | `true` if token is allowed for betting |
| 5 | paused | `true` if token is temporarily disabled |
| 6 | balanceRisk | Risk percentage in basis points |

## Using Tokens in Your Code

Once you know which tokens are available, you can use them in your app:

```tsx
// Example token configuration
const DEGEN_TOKEN = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg"
}

// Native token (ETH/MATIC/AVAX etc)
const NATIVE_TOKEN = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH", // or "MATIC", "AVAX" depending on chain
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/ETH.svg"
}

// Use in BetSwirlSDKProvider
<BetSwirlSDKProvider 
  initialChainId={base.id}
  bankrollToken={DEGEN_TOKEN}
>
  <YourApp />
</BetSwirlSDKProvider>
```

## Available Tokens by Network (as of July 2025)

### Base
- **ETH** - Native token
- **DEGEN** - `0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed`
- **USDC** - `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **BETS** - `0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5`
- **PEPE** - `0x52b492a33E447Cdb854c7FC19F1e57E8BfA1777D`

### Other Networks
Check using the steps above as token availability may vary by network.

## Notes

- Token availability can change - always check the contract for the latest list
- `allowed = true` and `paused = false` means the token is active
- The native token always has address `0x0000000000000000000000000000000000000000`
- Token images follow the pattern: `https://www.betswirl.com/img/tokens/{SYMBOL}.svg`