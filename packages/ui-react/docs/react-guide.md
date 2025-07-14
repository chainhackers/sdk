# React Integration Guide

## Create Demo Project

```shell
# node --version
# v24.2.0

npm create vite@latest betswirl-ui-react-demo -- --template react-ts
cd betswirl-ui-react-demo
npm install
```

## Verify Installation

```shell
npm run dev
# Open http://localhost:5173
```

## Add BetSwirl

### Install

```shell
npm install @betswirl/ui
```

Package: [npmjs.com/package/@betswirl/ui](https://www.npmjs.com/package/@betswirl/ui)

### Update main.tsx

Add all providers directly or create an AppProviders component:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OnchainKitProvider, type AppConfig } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, type Hex } from 'viem'
import { WagmiProvider, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { BetSwirlSDKProvider } from '@betswirl/ui'
import '@betswirl/ui/styles.css'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

const onChainKitConfig: AppConfig = {
  wallet: {
    display: "modal",
  }
}

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider chain={base} config={onChainKitConfig}>
        <BetSwirlSDKProvider initialChainId={base.id}>
          <App />
        </BetSwirlSDKProvider>
      </OnchainKitProvider>
    </QueryClientProvider>
  </WagmiProvider>,
)
```

### Add Game Component

In `src/App.tsx`:

```tsx
import { CoinTossGame } from '@betswirl/ui'

// Add component
<div style={{ margin: '2rem 0' }}>
  <CoinTossGame />
</div>
```

### Run

```shell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy

### Push to GitHub

```shell
git init
git add .
git commit -m "Add BetSwirl casino game"
```

### Deploy to Vercel

* Sign in to [vercel.com](https://vercel.com) with GitHub
* Click "Add New..." → "Project"
* Select your repository
* Click "Import" → "Deploy"
* Get public URL after ~2 minutes

## Configuration

### BetSwirlSDKProvider Props

You can customize the SDK behavior with these optional props:

```tsx
<BetSwirlSDKProvider 
  initialChainId={base.id}
  affiliate="0x1234567890123456789012345678901234567890"  // Your affiliate address
  bankrollToken={customToken}                            // Default betting token
>
  <App />
</BetSwirlSDKProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `affiliate` | `string` | Your wallet address to receive affiliate commissions. If not provided, you won't earn commissions |
| `bankrollToken` | `object` | Default token for betting with address, symbol, decimals, and image. [See available tokens →](./checking-available-tokens.md) |

### Environment Variables

**You do NOT need any environment variables** when using this library. All configuration is done through React props.

### Advanced Configuration (Optional)

If you want to use a custom RPC endpoint for better performance, you can set:

```env
VITE_RPC_URL=https://your-custom-base-rpc.com
```

This library currently supports **Base network only**. The custom RPC URL will be used instead of the default Base RPC (`https://mainnet.base.org`).

**When to use custom RPC:**
- You have a premium RPC provider (Alchemy, Infura, etc.)
- You want better reliability or speed
- You're hitting rate limits on the default public RPC

**When NOT needed:**
- For most applications the default RPC works fine
- If you're just testing or getting started

## Example Result

* **GitHub Repository**: [github.com/chainhackers/betswirl-ui-react-demo](https://github.com/chainhackers/betswirl-ui-react-demo)
* **Live Demo**: [betswirl-ui-react-demo.vercel.app](https://betswirl-ui-react-demo.vercel.app)

