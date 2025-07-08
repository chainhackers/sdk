# Farcaster MiniKit Integration Guide

## Creating MiniKit Project with BetSwirl

### Using Existing Template

```shell
# Clone the SDK repository
git clone https://github.com/betswirl/sdk.git
cd sdk/examples/farcaster-frame

# Install dependencies
pnpm install --ignore-workspace
```

### Creating from Scratch

```shell
# Create new MiniKit project
npx create-onchain --mini
cd your-mini-project

# Install BetSwirl UI
npm install @betswirl/ui
```

**During installation:**
`Coinbase Developer Platform Client API Key` can be skipped (optional for basic functionality)
If needed, add to .env: `NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key`

## Setting up Providers

Update `app/providers.tsx`:

```tsx
"use client";

import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { type AppConfig } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { http, type Hex } from "viem";
import { WagmiProvider, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { BetSwirlSDKProvider, type TokenWithImage } from "@betswirl/ui";

const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
};

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

const onChainKitConfig: AppConfig = {
  wallet: {
    display: "modal",
  }
}

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={onChainKitConfig}
        >
          <BetSwirlSDKProvider initialChainId={base.id} bankrollToken={DEGEN_TOKEN}>
            {props.children}
          </BetSwirlSDKProvider>
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Adding Game Component

Add the game component in `app/page.tsx`:

```tsx
import { DiceGame } from "@betswirl/ui";
import "@betswirl/ui/styles.css";

// ... existing code ...

<main className="flex-1">
  <DiceGame />
</main>
```

## Start dev server

```shell
npm run dev
```

Open in browser http://localhost:3000/

## Environment Variables

`.env.example` 

Create a .env file in the root directory, or you can set environment variables in your Vercel project settings
Public variables (`NEXT_PUBLIC_*`) can be stored in the `.env` file

**How manifest generation works:**
The manifest file is automatically generated during build through api route `app/.well-known/farcaster.json/route.ts`. This endpoint reads environment variables and returns JSON with your mini-app configuration that Farcaster uses.

**Required variables for manifest:**
```bash
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="YOUR_PROJECT_NAME"
NEXT_PUBLIC_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_ICON=$NEXT_PUBLIC_URL/icon.png
NEXT_PUBLIC_APP_SUBTITLE="Your App Subtitle"
NEXT_PUBLIC_APP_DESCRIPTION="Your app description"
NEXT_PUBLIC_APP_SPLASH_IMAGE=$NEXT_PUBLIC_URL/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR="#your-color-in-hex"
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=games
```

```bash
# For app preview
NEXT_PUBLIC_APP_HERO_IMAGE=$NEXT_PUBLIC_URL/hero.png
```

**Manifest properties:**
Complete list of all available manifest properties with descriptions - [Define your application configuration](https://miniapps.farcaster.xyz/docs/guides/publishing#define-your-application-configuration). 

All properties are configured through environment variables in the `app/.well-known/farcaster.json/route.ts` file.

## Documentation

- [MiniKit Documentation](https://docs.base.org/wallet-app/build-with-minikit/quickstart)
- [Farcaster Frame Publishing](https://miniapps.farcaster.xyz/docs/guides/publishing)
