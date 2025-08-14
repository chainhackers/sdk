import { type CasinoChainId, chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { arbitrum, avalanche, avalancheFuji, base, baseSepolia, polygon } from "wagmi/chains"
import { BalanceProvider } from "../context/BalanceContext"
import { BetSwirlSDKProvider } from "../context/BetSwirlSDKProvider"
import { TokenProvider } from "../context/tokenContext"
import { getTokenImage } from "../lib/utils"
import type { TokenWithImage } from "../types/types"

const CHAINS = [base, arbitrum, avalanche, polygon, baseSepolia, avalancheFuji] as const
const DEFAULT_CHAIN = avalancheFuji

const queryClient = new QueryClient()

// Define tokens with images
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: getTokenImage("DEGEN"),
}

const ETH_TOKEN: TokenWithImage = {
  ...chainNativeCurrencyToToken(DEFAULT_CHAIN.nativeCurrency),
  image: getTokenImage("ETH"),
}

export const STORYBOOK_TOKENS = {
  ETH: ETH_TOKEN,
  DEGEN: DEGEN_TOKEN,
}

interface StorybookProvidersProps {
  children: ReactNode
  token?: TokenWithImage
}

export function StorybookProviders({ children, token = ETH_TOKEN }: StorybookProvidersProps) {
  const affiliate = import.meta.env.VITE_AFFILIATE_ADDRESS as Hex

  // Get RPC URLs for each chain, fallback to public RPCs if not configured
  const baseRpcUrl = import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org"
  const polygonRpcUrl = import.meta.env.VITE_POLYGON_RPC_URL || "https://polygon-rpc.com"
  const avalancheRpcUrl =
    import.meta.env.VITE_AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc"
  const arbitrumRpcUrl = import.meta.env.VITE_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc"
  const baseSepoliaRpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
  const avalancheFujiRpcUrl =
    import.meta.env.VITE_AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc"

  const config = createConfig({
    chains: CHAINS,
    transports: {
      [base.id]: http(baseRpcUrl),
      [arbitrum.id]: http(arbitrumRpcUrl),
      [avalanche.id]: http(avalancheRpcUrl),
      [polygon.id]: http(polygonRpcUrl),
      [baseSepolia.id]: http(baseSepoliaRpcUrl),
      [avalancheFuji.id]: http(avalancheFujiRpcUrl),
    },
  })

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
            bankrollToken={token}
            supportedChains={CHAINS.map((c) => c.id as CasinoChainId)}
          >
            <TokenProvider>
              <BalanceProvider>{children}</BalanceProvider>
            </TokenProvider>
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
