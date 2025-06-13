import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { http, type Hex } from "viem"
import { WagmiProvider, createConfig } from "wagmi"
import { base } from "wagmi/chains"
import { DEFAULT_AFFILIATE_HOUSE_EDGE } from "./consts"
import { BetSwirlSDKProvider } from "./context/BetSwirlSDKProvider"
import { DEGEN_TOKEN } from "./lib/tokens"

const CHAIN = base

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Hex
  const affiliateHouseEdge =
    Number(import.meta.env.VITE_AFFILIATE_HOUSE_EDGE) || DEFAULT_AFFILIATE_HOUSE_EDGE
  const rpcUrl = import.meta.env.VITE_RPC_URL
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
          <BetSwirlSDKProvider
            initialChainId={CHAIN.id}
            affiliate={affiliate}
            affiliateHouseEdge={affiliateHouseEdge}
            bankrollToken={DEGEN_TOKEN}
          >
            {children}
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
