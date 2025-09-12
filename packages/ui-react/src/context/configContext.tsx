import { casinoChainById } from "@betswirl/sdk-core"
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

  const context: ConfigContextValue = useMemo(
    () => ({
      affiliates,
      bankrollToken,
      filteredTokens,
      withExternalBankrollFreebets,
      testMode,
    }),
    [affiliates, bankrollToken, filteredTokens, withExternalBankrollFreebets, testMode],
  )

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
