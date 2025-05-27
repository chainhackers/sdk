import { type BettingConfig, BettingConfigContext } from "./useBettingConfig.ts"

export const BettingConfigProvider = ({
  value,
  children,
}: {
  value: BettingConfig
  children: React.ReactNode
}) => {
  return <BettingConfigContext.Provider value={value}>{children}</BettingConfigContext.Provider>
}
