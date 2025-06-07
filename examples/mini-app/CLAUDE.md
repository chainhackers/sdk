# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the mini-app component library.

## Widget Library Project Overview

This is a **game widget library** (`@chainhackers/ui`) designed to make casino game integration **incredibly simple** for developers. The goal is to enable any developer to add a fully functional casino game to their website with just a few lines of code.

### Project Mission
Transform complex BetSwirl protocol interactions into **plug-and-play React components** that work like widgets. Developers should be able to add a casino game as easily as embedding a YouTube video.

### Target Integration Experience
```jsx
// Goal: This simple integration should be all that's needed
const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
})

export function MyApp() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <OnchainKitProvider chain={base}>
          <BetSwirlSDKProvider initialChainId={8453} affiliate="0x0">
            <CoinTossGame />
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

The library is built as a publishable npm package with both ES modules and CommonJS support.

## Development Commands

### Development Server
- `pnpm dev` - Start Vite development server
- `pnpm preview` - Preview production build

### Building and Publishing
- `pnpm build` - Build library for production (cleans dist, compiles TypeScript, builds with Vite, copies assets)
- `pnpm prepublishOnly` - Automatically runs build before publishing

### Code Quality
- `pnpm lint` - Run Biome checks (replaces ESLint)
- `pnpm lint:fix` - Auto-fix Biome issues
- `pnpm format` - Format code with Biome

### Storybook Development
- `pnpm storybook` - Start Storybook dev server on port 6006
- `pnpm build-storybook` - Build static Storybook

### Visual Testing
- `pnpm test:loki` - Run Loki visual regression tests with Chrome tolerance

### Deployment
- Production deployment uses specific server permissions:
  ```bash
  setfacl -R -m u:dev-components:rwx /var/www/betswirl-sdk/
  ```

## Architecture

### Component Structure
```
src/
├── components/
│   ├── game/              # Casino game components
│   │   ├── CoinTossGame.tsx
│   │   ├── GameFrame.tsx
│   │   ├── GameResultWindow.tsx
│   │   ├── HistorySheetPanel.tsx
│   │   └── InfoSheetPanel.tsx
│   └── ui/                # Base UI components (shadcn/ui style)
├── context/               # React contexts for SDK integration
│   ├── BetSwirlSDKProvider.tsx  # Main provider wrapper
│   ├── chainContext.tsx         # Multi-chain management
│   └── configContext.tsx        # Configuration (affiliate settings)
├── hooks/                 # Game-specific hooks
│   ├── usePlaceBet.ts           # Betting operations
│   ├── useBetResultWatcher.ts   # Real-time result monitoring
│   ├── useGameHistory.ts        # User bet history
│   ├── useEstimateVRFFees.ts    # VRF cost calculation
│   ├── useHouseEdge.ts          # Affiliate house edge
│   └── useGasPrice.ts           # Optimized gas pricing
├── lib/                   # Utilities and tokens
├── types/                 # TypeScript definitions
└── assets/               # Game assets, fonts, images
```

### Key Dependencies
- **React 18/19**: Peer dependency for flexibility
- **Wagmi 2.15+**: Ethereum React hooks
- **OnchainKit**: Coinbase's React components for web3
- **Radix UI**: Headless UI primitives
- **Tailwind CSS 4**: Utility-first styling
- **Viem 2.29.1**: Ethereum TypeScript library
- **BetSwirl SDK Core 0.1.3+**: Protocol interaction
- **BetSwirl Wagmi Provider 0.1.3+**: Wagmi integration

### Build Configuration
- **Vite Library Mode**: Builds both ES (.mjs) and CJS (.js) formats
- **External Dependencies**: Major dependencies externalized for tree shaking
- **Asset Handling**: Assets copied to `dist/assets/`, CSS as `index.css`

### Code Quality Setup
- **Biome Configuration**: Local `biome.json` extends root workspace config
- **JavaScript Formatting**: Uses "asNeeded" semicolons style
- **Replaces ESLint**: Project migrated from ESLint to Biome for faster linting

## New Architecture (Post-Update)

### Multi-Chain Context System
- **BetSwirlSDKProvider**: Main wrapper combining chain and config contexts
- **ChainContext**: Manages app chain vs wallet chain synchronization
- **ConfigContext**: Simplified affiliate configuration management

### Enhanced Gaming Hooks
- **useGameHistory**: Fetches formatted betting history with relative timestamps
- **useEstimateVRFFees**: Real-time VRF cost estimation with gas buffers
- **useHouseEdge**: Affiliate-specific house edge retrieval
- **useGasPrice**: Optimized gas pricing with chain-specific strategies

### Real-time Features
- **Gas Price Monitoring**: Updates every 10 seconds with React Query
- **Chain Synchronization**: Automatic wallet/app chain alignment
- **VRF Cost Estimation**: Dynamic fee calculation with 26% safety buffer
- **History Refresh**: Manual and automatic bet history updates

## Widget Integration Approach

### Design Philosophy: "Degen" Minimalism
- **Minimalistic UI** aligned with "degen" (decentralized generation) crypto gaming culture
- **Essential info only** on surface, complex details hidden in tooltips
- **Fixed mobile-first design** (360px width, non-adaptive initially)
- **Dark/light theme support** with customizable primary colors
- **RNG fees and gas prices** hidden in subtle popovers, not prominent

### Current Widget Status: CoinTossGame
**✅ Live and Functional**
- Fully working game component with real on-chain betting
- Supports wallet connection via OnchainKit (Coinbase Wallet, MetaMask)
- Real-time VRF randomness and result monitoring
- Betting controls: amount input, 1/2, x2, max, play button
- Game history and result windows

**🔧 Quick Demo & Testing**
- Available in Storybook for immediate preview at `http://localhost:6006/`
- Works best with desktop browser wallets
- Mobile wallet support in development

#### **Running Component Demo Locally**
For developers who want to see the component in action without integrating into their project:

```bash
# 1. Install pnpm globally (if not installed)
npm install -g pnpm

# 2. Navigate to mini-app directory
cd examples/mini-app

# 3. Install dependencies (ignore workspace to use published packages)
pnpm install --ignore-workspace

# 4. Start Storybook demo
pnpm storybook

# 5. Open browser to: http://localhost:6006/
```

**Note:** The `--ignore-workspace` flag ensures dependencies are installed from npm registry, simulating real-world library usage.

### Developer Integration Examples

#### Installation (When Published)
```bash
npm install @chainhackers/ui
# or
pnpm add @chainhackers/ui
```

#### Example 1: Basic Integration (Default Theme)
```jsx
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { BetSwirlSDKProvider, CoinTossGame } from '@chainhackers/ui'
import '@chainhackers/ui/styles.css'

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
})

export function BasicGamePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <OnchainKitProvider chain={base}>
          <BetSwirlSDKProvider initialChainId={8453} affiliate="0x0">
            <CoinTossGame />
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

#### Example 2: Custom Themed Integration
```jsx
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { BetSwirlSDKProvider, CoinTossGame } from '@chainhackers/ui'
import '@chainhackers/ui/styles.css'

const config = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
})

export function CustomGamePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <OnchainKitProvider chain={base}>
          <BetSwirlSDKProvider initialChainId={8453} affiliate="0x0">
            <CoinTossGame
              theme="dark"
              customTheme={{
                "--primary": "#ff6b35",
                "--play-btn-font": "#ffffff",
                "--game-window-overlay": "rgba(0,0,0,0.8)"
              }}
              backgroundImage="/my-custom-background.png"
            />
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Current Limitations & Next Steps

**⚠️ Not Yet Ready for External Integration**
- Package not published to npm yet
- Need to finalize external dependency handling
- Mobile wallet integration incomplete

**🚀 Immediate Roadmap**
- Publish first npm package
- Polish token selection and mobile layout
- Begin Farcaster Frame integration
- Add DiceGame component (planned)

**🎯 Future Games Pipeline**
- DiceGame with number range slider (1-99)
- Roulette, Keno components
- Shared GameFrame architecture for consistency

### Development Guidelines

#### Component Architecture
- **GameFrame**: Reusable wrapper for all game types
- **GameWindow**: Game-specific visuals and animations
- **GameMenu**: Shared betting controls (amount, 1/2, x2, max, play)
- **BetSwirlSDKProvider**: Main context wrapper

#### Styling Approach
- **Tailwind CSS 4** with custom theme
- **Inter font** with specific weights (medium: 500, semibold: 600, bold: 700)
- **CSS custom properties** for theme customization
- **tw-animate-css** for game animations


### Protocol Integration
Reference `/documentation/dictionary.md` for BetSwirl protocol understanding:
- **VRF Fees**: Chainlink randomness cost (hidden in tooltips)
- **House Edge**: 2.5-4% casino advantage
- **Affiliate**: Developer earns ~30% commission on losses
- **Multi-chain**: Base, Arbitrum, Polygon, BSC, Avalanche support