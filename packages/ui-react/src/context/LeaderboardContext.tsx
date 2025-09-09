import { createContext, type ReactNode, useContext, useMemo } from "react"
import type { PlayNowEvent } from "../types/types"

interface LeaderboardContextValue {
  onPlayNow?: (event: PlayNowEvent) => void
}

const LeaderboardContext = createContext<LeaderboardContextValue>({})

interface LeaderboardProviderProps {
  children: ReactNode
  onPlayNow?: (event: PlayNowEvent) => void
}

export function LeaderboardProvider({ children, onPlayNow }: LeaderboardProviderProps) {
  const contextValue = useMemo(() => ({ onPlayNow }), [onPlayNow])

  return <LeaderboardContext.Provider value={contextValue}>{children}</LeaderboardContext.Provider>
}

export function useLeaderboardContext() {
  return useContext(LeaderboardContext)
}
