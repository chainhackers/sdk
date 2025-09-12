import { casinoChainById } from "@betswirl/sdk-core"
import { createContext, useContext, useMemo } from "react"
import { Address } from "viem"
import type { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

export type ConfigContextValue = {
  affiliate: Address
  affiliates: Address[]
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  freebetsAffiliates?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode: boolean
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export const useBettingConfig = () => {
  const configContext = useContext(ConfigContext) as ConfigContextValue
  if (!configContext) throw new Error("useBettingConfig must be used inside ConfigProvider")
  return configContext
}

export type ConfigProviderProps = {
  children: React.ReactNode
  affiliate?: Address
  bankrollToken?: TokenWithImage
  filteredTokens?: Address[]
  freebetsAffiliates?: Address[]
  withExternalBankrollFreebets?: boolean
  testMode?: boolean
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const {
    children,
    affiliate: initialAffiliate,
    bankrollToken,
    filteredTokens,
    freebetsAffiliates,
    withExternalBankrollFreebets = false,
    testMode = false,
  } = props
  const { appChain, availableChainIds } = useChain()

  const affiliate = useMemo(
    () => initialAffiliate ?? appChain.defaultAffiliate,
    [initialAffiliate, appChain],
  )

  const affiliates = useMemo(() => {
    if (freebetsAffiliates) {
      return freebetsAffiliates
    }
    const defaultAffiliates = availableChainIds.map((id) => casinoChainById[id].defaultAffiliate)
    return Array.from(new Set(defaultAffiliates))
  }, [freebetsAffiliates, availableChainIds])

  const context: ConfigContextValue = useMemo(
    () => ({
      affiliate,
      affiliates,
      bankrollToken,
      filteredTokens,
      freebetsAffiliates,
      withExternalBankrollFreebets,
      testMode,
    }),
    [
      affiliate,
      affiliates,
      bankrollToken,
      filteredTokens,
      freebetsAffiliates,
      withExternalBankrollFreebets,
      testMode,
    ],
  )

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
