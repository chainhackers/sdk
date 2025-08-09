import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { avalanche, base, polygon } from "wagmi/chains"
import { QUERY_DEFAULTS } from "./constants/queryDefaults"
import { BalanceProvider } from "./context/BalanceContext"
import { BetSwirlSDKProvider } from "./context/BetSwirlSDKProvider"
import { FreebetsProvider } from "./context/FreebetsContext"
import { TokenProvider } from "./context/tokenContext"

// Define supported chains in one place
const SUPPORTED_CHAINS = [base, polygon, avalanche] as const
const DEFAULT_CHAIN = base

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.STALE_TIME,
      refetchOnWindowFocus: QUERY_DEFAULTS.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: QUERY_DEFAULTS.REFETCH_ON_RECONNECT,
      retry: QUERY_DEFAULTS.RETRY_COUNT,
      structuralSharing: true,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Hex

  // Get RPC URLs for each chain, fallback to public RPCs if not configured
  const baseRpcUrl = import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org"
  const polygonRpcUrl = import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com"
  const avalancheRpcUrl =
    import.meta.env.VITE_AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc"

  const config = createConfig({
    chains: SUPPORTED_CHAINS,
    transports: {
      [base.id]: http(baseRpcUrl),
      [polygon.id]: http(polygonRpcUrl),
      [avalanche.id]: http(avalancheRpcUrl),
    },
  })

  const freebetsAffiliates = affiliate ? [affiliate] : undefined

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={DEFAULT_CHAIN}
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
            initialChainId={DEFAULT_CHAIN.id}
            affiliate={affiliate}
            supportedChains={SUPPORTED_CHAINS.map((chain) => chain.id)}
            freebetsAffiliates={freebetsAffiliates}
            withExternalBankrollFreebets={true}
          >
            <TokenProvider>
              <FreebetsProvider>
                <BalanceProvider>{children}</BalanceProvider>
              </FreebetsProvider>
            </TokenProvider>
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
