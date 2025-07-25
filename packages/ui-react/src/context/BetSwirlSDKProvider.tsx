import { CasinoChainId } from "@betswirl/sdk-core"
import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProvider, ConfigProviderProps } from "./configContext"

type BetSwirlSDKProviderProps = ChainProviderProps &
  ConfigProviderProps & {
    supportedChains?: CasinoChainId[]
  }

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (props) => {
  const { children, initialChainId, affiliate, bankrollToken, filteredTokens, supportedChains } =
    props

  return (
    <ChainProvider initialChainId={initialChainId} supportedChains={supportedChains}>
      <ConfigProvider
        affiliate={affiliate}
        bankrollToken={bankrollToken}
        filteredTokens={filteredTokens}
      >
        {children}
      </ConfigProvider>
    </ChainProvider>
  )
}
