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
import { OnchainKitProvider } from '@coinbase/onchainkit'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider 
          chain={base}
          config={{
            wallet: {
              display: "modal",
              termsUrl: "https://example.com/terms",
              privacyUrl: "https://example.com/privacy",
            },
            appearance: {
              name: "CoinToss Game",
              mode: "auto",
            },
          }}
        >
          <BetSwirlSDKProvider initialChainId={base.id}>
            <App />
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
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

## Example Result

* **GitHub Repository**: [github.com/chainhackers/betswirl-ui-react-demo](https://github.com/chainhackers/betswirl-ui-react-demo)
* **Live Demo**: [betswirl-ui-react-demo.vercel.app](https://betswirl-ui-react-demo.vercel.app)

