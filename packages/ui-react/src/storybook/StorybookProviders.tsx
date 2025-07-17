import { type CasinoChainId, chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { arbitrum, avalanche, base, polygon } from "wagmi/chains"
import { BalanceProvider } from "../context/BalanceContext"
import { BetSwirlSDKProvider } from "../context/BetSwirlSDKProvider"
import { TokenProvider } from "../context/tokenContext"
import type { TokenWithImage } from "../types/types"

const CHAINS = [base, arbitrum, avalanche, polygon] as const
const DEFAULT_CHAIN = base

const queryClient = new QueryClient()

// Define tokens with images
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
}

const ETH_TOKEN: TokenWithImage = {
  ...chainNativeCurrencyToToken(DEFAULT_CHAIN.nativeCurrency),
  image: "https://www.betswirl.com/img/tokens/ETH.svg",
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
  const rpcUrl = import.meta.env.VITE_RPC_URL
  const config = createConfig({
    chains: CHAINS,
    transports: {
      [base.id]: http(rpcUrl),
      [arbitrum.id]: http(rpcUrl),
      [avalanche.id]: http(rpcUrl),
      [polygon.id]: http(rpcUrl),
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
