import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProvider, ConfigProviderProps } from "./configContext"
import { TokenProvider } from "./tokenContext"

type BetSwirlSDKProviderProps = ChainProviderProps & ConfigProviderProps

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (props) => {
  const { children, initialChainId, affiliate, bankrollToken, filteredTokens } = props

  return (
    <ChainProvider initialChainId={initialChainId}>
      <ConfigProvider
        affiliate={affiliate}
        bankrollToken={bankrollToken}
        filteredTokens={filteredTokens}
      >
        <TokenProvider initialToken={bankrollToken}>{children}</TokenProvider>
      </ConfigProvider>
    </ChainProvider>
  )
}
