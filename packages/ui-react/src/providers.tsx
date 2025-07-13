import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { avalanche, base, polygon } from "wagmi/chains"
import { QUERY_DEFAULTS } from "./constants/queryDefaults"
import { BalanceProvider } from "./context/BalanceContext"
import { BetSwirlSDKProvider } from "./context/BetSwirlSDKProvider"
import type { TokenWithImage } from "./types/types"

const CHAIN = base

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.STALE_TIME,
      refetchOnWindowFocus: QUERY_DEFAULTS.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: QUERY_DEFAULTS.REFETCH_ON_RECONNECT,
      retry: QUERY_DEFAULTS.RETRY_COUNT,
    },
  },
})

// Define tokens with images
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
}

export function AppProviders({ children }: { children: ReactNode }) {
  const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Hex
  const rpcUrl = import.meta.env.VITE_RPC_URL
  const config = createConfig({
    chains: [CHAIN, polygon, avalanche],
    transports: {
      [CHAIN.id]: http(rpcUrl),
      [polygon.id]: http(),
      [avalanche.id]: http(),
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
            bankrollToken={DEGEN_TOKEN}
            supportedChains={[base.id, polygon.id, avalanche.id]}
          >
            <BalanceProvider>{children}</BalanceProvider>
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
