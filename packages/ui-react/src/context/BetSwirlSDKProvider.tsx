import { CasinoChainId } from "@betswirl/sdk-core"
import React from "react"
import { ChainProvider, ChainProviderProps } from "./chainContext"
import { ConfigProvider, ConfigProviderProps } from "./configContext"

type BetSwirlSDKProviderProps = ChainProviderProps &
  ConfigProviderProps & {
    supportedChains: CasinoChainId[]
  }

export const BetSwirlSDKProvider: React.FC<BetSwirlSDKProviderProps> = (props) => {
  const {
    children,
    initialChainId,
    affiliates,
    bankrollToken,
    filteredTokens,
    supportedChains,
    withExternalBankrollFreebets,
    testMode,
  } = props

  return (
    <ChainProvider initialChainId={initialChainId} supportedChains={supportedChains}>
      <ConfigProvider
        affiliates={affiliates}
        bankrollToken={bankrollToken}
        filteredTokens={filteredTokens}
        withExternalBankrollFreebets={withExternalBankrollFreebets}
        testMode={testMode}
      >
        {children}
      </ConfigProvider>
    </ChainProvider>
  )
}
