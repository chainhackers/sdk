import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProvider, ConfigProviderProps } from "./configContext"

type BetSwirlSDKProviderProps = ChainProviderProps & ConfigProviderProps

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (props) => {
  const { children, initialChainId, affiliate, affiliateHouseEdge } = props

  return (
    <ChainProvider initialChainId={initialChainId}>
      <ConfigProvider affiliate={affiliate} affiliateHouseEdge={affiliateHouseEdge}>
        {children}
      </ConfigProvider>
    </ChainProvider>
  )
}
