# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build
- `pnpm build` - Build all packages using Turborepo
- `pnpm build:libs` - Build only library packages
- `pnpm build:libs:prod` - Production build with NODE_ENV=production

### Linting
- `pnpm lint` - Run Biome linter (check only)
- `pnpm lint --fix` - Run Biome linter with auto-fix

### Package Management
- `pnpm install` - Install dependencies
- `pnpm change:add` - Add a new changeset for version management
- `pnpm change:version` - Update package versions
- `pnpm change:publish` - Build and publish packages to npm

### Development in UI React Example
When working in `packages/ui-react/`:
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm storybook` - Run Storybook for component development

### E2E Testing
- `pnpm test:e2e` - Run end-to-end tests with Synpress and Playwright
- `pnpm test:clear-cache` - Clear test cache (run after changing wallet setup)
- `pnpm test:cointoss`, `pnpm test:dice`, `pnpm test:roulette`, `pnpm test:keno` - Run individual game tests
- Test wallet address is read from `.secrets` file
- Check wallet balances on block explorers before running tests:
  - Base: https://basescan.org/address/{wallet_address}
  - Polygon: https://polygonscan.com/address/{wallet_address}
  - Avalanche: https://snowtrace.io/address/{wallet_address}
- **Important**: Follow the E2E testing best practices documented in `packages/ui-react/test/best-practices.md`

## Memories
- When working with ui-react, run pnpm commands in packages/ui-react, not project root
- Avoid using the word "implement" in commit messages, use "add" and keep commit messages brief
- Don't add attribution to commit messages, skip "Generated with Claude Code" and co-authored-by lines

## Architecture Overview

### Monorepo Structure
This is a pnpm workspace monorepo with three main areas:

1. **`packages/core`** - Core SDK functionality
   - VanillaJS library for BetSwirl protocol interaction
   - Actions for game operations (placeBet, claimBet, etc.)
   - Provider abstraction for wallet/client interactions
   - GraphQL integration for historical data via subgraphs
   - Type definitions and interfaces

2. **`packages/providers/wagmi`** - Wagmi adapter
   - Implements BetSwirlClient and BetSwirlWallet interfaces
   - Bridges core SDK with Wagmi hooks

3. **`packages/ui-react`** - React example application
   - Demonstrates SDK usage with React hooks
   - Custom hooks for betting logic (usePlaceBet, useBetRequirements, etc.)
   - Context providers for SDK configuration
   - UI components using shadcn/ui and Tailwind CSS

### Key Architectural Patterns

1. **Provider Pattern**: The SDK uses an abstract provider pattern allowing different wallet/client implementations. Core SDK doesn't depend on any specific wallet library.

2. **Function Data Pattern**: All blockchain interactions return "function data" objects that can be executed by the provider, keeping the core SDK chain-agnostic.

3. **Token Handling**: 
   - Native tokens (ETH, MATIC/POL, AVAX) always use address `0x0000...0000` (`zeroAddress` in Viem)
   - All native currencies across all chains use `zeroAddress` - there are no exceptions
   - ERC20 tokens require approval before betting
   - Token allowances are managed via the `useTokenAllowance` hook

4. **VRF Integration**: Uses Chainlink VRF 2.5 for randomness. VRF fees are deducted from native token balance when calculating max bet amounts.

5. **Basis Points**: All percentage calculations use basis points (100 = 1%) for precision in smart contracts.

### Protocol Concepts

- **Affiliates**: Frontend operators who earn ~30% commission on house edge
- **Bankroll Providers**: Liquidity providers who earn ~20% of profits
- **House Edge**: Typically 2.5-4%, split between protocol, affiliates, and bankroll providers
- **Normal vs Weighted Games**: Normal games have individual contracts, weighted games share a contract
- **VRF Fees**: Small native token fee required for each bet to pay for Chainlink randomness

### Smart Contract Addresses
All mainnet contracts share the same address across chains:
- Bank: `0x8FB3110015FBCAA469ee45B64dcd2BdF544B9CFA`
- CoinToss: `0xC3Dff2489F8241729B824e23eD01F986fcDf8ec3`
- Dice: `0xAa4D2931a9fE14c3dec8AC3f12923Cbb535C0e5f`
- Roulette: `0x6678e3B4AB2a8C8Cdd068F132C21293CcBda33cb`

### Code Standards

- **TypeScript**: Strict mode enabled, ES2021 target
- **Formatting**: Biome with 2-space indentation, 100-char lines
- **Imports**: Use ES modules, prefer named exports
- **React**: Functional components with hooks
- **State Management**: React Context for global state
- **Styling**: Tailwind CSS with shadcn/ui components
