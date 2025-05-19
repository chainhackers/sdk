import { createContext, useContext } from "react"
import { Hex } from "viem"

export type BettingConfig = {
  affiliate?: Hex
}
export const BettingConfigContext = createContext<BettingConfig | undefined>(
  undefined,
)
export const useBettingConfig = () => {
  const context = useContext(BettingConfigContext)
  if (!context)
    throw new Error(
      "useBettingConfig must be used inside BettingConfigProvider",
    )
  return context
}
