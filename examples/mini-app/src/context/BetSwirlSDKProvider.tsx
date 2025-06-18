import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProvider, ConfigProviderProps } from "./configContext"

type BetSwirlSDKProviderProps = ChainProviderProps & ConfigProviderProps

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (props) => {
  const { children, initialChainId, affiliate, bankrollToken } = props

  return (
    <ChainProvider initialChainId={initialChainId}>
      <ConfigProvider affiliate={affiliate} bankrollToken={bankrollToken}>
        {children}
      </ConfigProvider>
    </ChainProvider>
  )
}
