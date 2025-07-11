import { chainNativeCurrencyToToken } from "@betswirl/sdk-core"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { type Hex, http } from "viem"
import { createConfig, WagmiProvider } from "wagmi"
import { base } from "wagmi/chains"
import { BetSwirlSDKProvider } from "../context/BetSwirlSDKProvider"
import type { TokenWithImage } from "../types/types"

const CHAIN = base

const queryClient = new QueryClient()

// Define tokens with images
const DEGEN_TOKEN: TokenWithImage = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
  image: "https://www.betswirl.com/img/tokens/DEGEN.svg",
}

const ETH_TOKEN: TokenWithImage = {
  ...chainNativeCurrencyToToken(CHAIN.nativeCurrency),
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
            bankrollToken={token}
          >
            {children}
          </BetSwirlSDKProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
