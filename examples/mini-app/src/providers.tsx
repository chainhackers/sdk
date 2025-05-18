import { type ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, type Hex } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { BettingConfigProvider } from "./context/BettingConfigContext.tsx"

const CHAIN = base

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY as string
  const affiliate = import.meta.env.AFFILIATE_ADDRESS as Hex

  if (!apiKey && import.meta.env.DEV) {
    console.warn(
      "OnchainKit API Key (VITE_PUBLIC_ONCHAINKIT_API_KEY) is missing. Some OnchainKit features might not work as expected.",
    )
  }

  const rpcUrl = import.meta.env.VITE_RPC_URL
  if (!rpcUrl) {
    throw new Error("RPC URL is not set")
  }
  const config = createConfig({
    chains: [CHAIN],
    transports: {
      [CHAIN.id]: http(rpcUrl),
    },
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey}
          chain={CHAIN}
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
          <BettingConfigProvider value={{ affiliate }}>
            {children}
          </BettingConfigProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
