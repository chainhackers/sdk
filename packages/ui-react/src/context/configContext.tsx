import { createContext, useContext, useMemo } from "react"
import { Address } from "viem"
import type { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

export type ConfigContextValue = {
  affiliate: Address
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
  testMode: boolean
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const {
    children,
    affiliate: initialAffiliate,
    bankrollToken,
    filteredTokens,
    freebetsAffiliates,
    withExternalBankrollFreebets = false,
    testMode,
  } = props
  const { appChain } = useChain()

  // Use the initial affiliate if provided, otherwise use the default affiliate for the app chain
  const affiliate = useMemo(
    () => initialAffiliate ?? appChain.defaultAffiliate,
    [initialAffiliate, appChain],
  )

  const context: ConfigContextValue = useMemo(
    () => ({
      affiliate,
      bankrollToken,
      filteredTokens,
      freebetsAffiliates,
      withExternalBankrollFreebets,
      testMode,
    }),
    [
      affiliate,
      bankrollToken,
      filteredTokens,
      freebetsAffiliates,
      withExternalBankrollFreebets,
      testMode,
    ],
  )

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
