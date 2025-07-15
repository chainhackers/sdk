# Farcaster MiniKit Integration Guide

## Create MiniKit Project with BetSwirl

### Using Existing Template

```shell
# Clone the SDK repository
git clone https://github.com/betswirl/sdk.git
cd sdk/examples/farcaster-frame

# Install dependencies
pnpm install --ignore-workspace
```

### Create from Scratch

```shell
# Create new MiniKit project
npx create-onchain --mini
cd your-mini-project

# Install BetSwirl UI
npm install @betswirl/ui-react
```

**During installation:**
`Coinbase Developer Platform Client API Key` can be skipped (optional for basic functionality)
If needed, add to .env: `NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key`

### Set up Providers

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
import { BetSwirlSDKProvider, type TokenWithImage } from "@betswirl/ui-react";

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

### Add Game Component

Add the game component in `app/page.tsx`:

```tsx
import { DiceGame } from "@betswirl/ui-react";
import "@betswirl/ui-react/styles.css";

// ... existing code ...

<main className="flex-1">
  <DiceGame />
</main>
```

### Start dev server

```shell
npm run dev
```

Open in browser http://localhost:3000/

## Environment Variables

`.env.example` 

Configure the `.env` file in the root directory (included with the template), or you can set environment variables in your Vercel project settings.

**Security note**: The manifest file is publicly accessible at `/.well-known/farcaster.json`. Never store sensitive data in manifest environment variables. If you don't need certain environment variables, you can leave them empty.

**How manifest generation works:**
The manifest file is automatically generated during build through api route `app/.well-known/farcaster.json/route.ts`. This endpoint reads environment variables and returns JSON with your mini-app configuration that Farcaster uses.

**Required variables for manifest:**
```bash
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="YOUR_PROJECT_NAME"
NEXT_PUBLIC_URL="https://[your-app].vercel.app"
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

These variables may not be filled in, but they must at least be present in the .env file with empty values, otherwise the manifest will be displayed as invalid.
```bash
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=
```

**Manifest properties:**
Complete list of all available manifest properties with descriptions - [Define your application configuration](https://miniapps.farcaster.xyz/docs/guides/publishing#define-your-application-configuration). 

All properties are configured through environment variables in the `app/.well-known/farcaster.json/route.ts` file.

## Deploy to Vercel

Choose one of the following deployment methods:

**Vercel CLI**
```shell
# Install Vercel CLI
npm i -g vercel

# Run deployment from root project
vercel
```
If you deploy to a new project, the domain will be created from the project's name. If such a domain already exists, Vercel will generate a new one based on the project's name. You can find your public domain in the project settings on Vercel.

**Git Integration**
* Sign in to [vercel.com](https://vercel.com) with GitHub
* Click "Add New..." → "Project"
* Select your repository
* Click "Import" → "Deploy"
* Get public URL after ~2 minutes

If you added environment variables for the manifest (e.g., NEXT_PUBLIC_URL) in Vercel project settings after deployment, you need to redeploy. Go to deployments, navigate to your project and click redeploy.   
![Redeploy](screenshots/redeploy.png)

[Managing Deployments](https://vercel.com/docs/projects/project-dashboard#deployments)

## Publish and Test mini-app in Farcaster
Detailed instructions can be found here - https://miniapps.farcaster.xyz/docs/guides/publishing#steps

After deployment, the manifest can be viewed at this URL - https://[your-app].vercel.app/.well-known/farcaster.json

### Test mini-app:
To test your mini-app in Farcaster, you don't need to publish the manifest.

1. Go to https://farcaster.xyz/~/developers/mini-apps/manifest
2. Paste your domain in the field without https and trailing slash (`[your-app].vercel.app`)

After that, you'll be able to see your manifest and launch the mini-app in the Farcaster frame. 

If the manifest is valid, you'll see - "Mini App configuration is valid."

You can launch the application by clicking the Launch button.
![Testing mini-app](screenshots/launchMiniApp.png)

If the manifest is not valid, you'll see - "[your-app].vercel.app does not have a valid manifest setup."
![Testing mini-app](screenshots/notValidManifest.png)

### Publish Manifest:

1. Go to https://farcaster.xyz/~/developers/mini-apps/manifest
2. Click the "Manage" button
![Publishing Manifest](screenshots/manifestManage.png)
3. Enter the domain address and fill in all necessary fields and click "Submit"
![Publishing Manifest](screenshots/createManifest.png)

After that, you'll get a URL like - https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_MANIFEST_ID

**If you're using our "farcaster-frame" template, you need to:**
* Add the FARCASTER_MANIFEST_URL environment variable with this url to your .env file
* Update deployment

If you created the application from scratch, then you need to set up a redirect to your manifest in the next.config file.   
[Next js redirects documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)   
You can find an example at `sdk/examples/farcaster-frame/next.config.mjs`. 

### Post your mini-app

Once you have a valid manifest, you can share your mini-app by posting its URL (https://[your-app].vercel.app) in a Farcaster cast. Users will be able to launch it directly from the cast. This will work even without publishing the manifest and generating Account association.

## Documentation

- [MiniKit Documentation](https://docs.base.org/wallet-app/build-with-minikit/quickstart)
- [Farcaster Frame Publishing](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [Deploying to Vercel](https://vercel.com/docs/deployments)
