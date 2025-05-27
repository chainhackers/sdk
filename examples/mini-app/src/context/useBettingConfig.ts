import { createContext, useContext } from "react"

export type BettingConfig = {
  affiliate?: string
}
export const BettingConfigContext = createContext<BettingConfig | undefined>(undefined)
export const useBettingConfig = () => {
  const context = useContext(BettingConfigContext)
  if (!context) throw new Error("useBettingConfig must be used inside BettingConfigProvider")
  return context
}
