import { type CasinoChainId, casinoChainById } from "@betswirl/sdk-core"
import { createContext, useContext, useMemo } from "react"
import { Address } from "viem"
import type { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

export type ConfigContextValue = {
  affiliates: Address[]
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode: boolean
  getAffiliateForChain: (chainId: CasinoChainId) => Address
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export const useBettingConfig = () => {
  const configContext = useContext(ConfigContext) as ConfigContextValue
  if (!configContext) throw new Error("useBettingConfig must be used inside ConfigProvider")
  return configContext
}

export type ConfigProviderProps = {
  children: React.ReactNode
  affiliates?: Address[]
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode?: boolean
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const {
    children,
    affiliates: userAffiliates,
    bankrollToken,
    filteredTokens,
    withExternalBankrollFreebets = false,
    testMode = false,
  } = props
  const { availableChainIds } = useChain()

  const affiliates = useMemo(() => {
    if (userAffiliates) {
      return userAffiliates
    }
    const defaultAffiliates = availableChainIds.map((id) => casinoChainById[id].defaultAffiliate)
    return Array.from(new Set(defaultAffiliates))
  }, [userAffiliates, availableChainIds])

  const getAffiliateForChain = useMemo(
    () => (chainId: CasinoChainId) => {
      // If user provided affiliates, use the first one for all chains
      if (userAffiliates?.[0]) {
        return userAffiliates[0]
      }
      // Otherwise use the default affiliate for the specific chain
      const chainConfig = casinoChainById[chainId]
      if (!chainConfig?.defaultAffiliate) {
        throw new Error(`No default affiliate found for chain: ${chainId}`)
      }
      return chainConfig.defaultAffiliate
    },
    [userAffiliates],
  )

  const context: ConfigContextValue = useMemo(
    () => ({
      affiliates,
      bankrollToken,
      filteredTokens,
      withExternalBankrollFreebets,
      testMode,
      getAffiliateForChain,
    }),
    [
      affiliates,
      bankrollToken,
      filteredTokens,
      withExternalBankrollFreebets,
      testMode,
      getAffiliateForChain,
    ],
  )

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
