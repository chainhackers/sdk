import { createContext, useContext, useMemo } from "react"
import { Address } from "viem"
import { DEFAULT_AFFILIATE_HOUSE_EDGE } from "../consts"
import type { TokenWithImage } from "../types"
import { useChain } from "./chainContext"

export type ConfigContextValue = {
  affiliate: Address
  affiliateHouseEdge: number
  bankrollToken?: TokenWithImage
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
  affiliateHouseEdge?: number
  bankrollToken?: TokenWithImage
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const {
    children,
    affiliate: initialAffiliate,
    affiliateHouseEdge = DEFAULT_AFFILIATE_HOUSE_EDGE,
    bankrollToken,
  } = props
  const { appChain } = useChain()

  // Use the initial affiliate if provided, otherwise use the default affiliate for the app chain
  const affiliate = useMemo(
    () => initialAffiliate ?? appChain.defaultAffiliate,
    [initialAffiliate, appChain],
  )

  const context: ConfigContextValue = {
    affiliate,
    affiliateHouseEdge,
    bankrollToken,
  }

  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
}
