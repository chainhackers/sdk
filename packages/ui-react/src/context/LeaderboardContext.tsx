import { createContext, type ReactNode, useContext, useMemo, useState } from "react"
import { useLeaderboards } from "../hooks/useLeaderboards"
import type { LeaderboardItemWithEnriched, PlayNowEvent } from "../types/types"

interface LeaderboardContextValue {
  onPlayNow?: (event: PlayNowEvent) => void
  ongoingLeaderboards: LeaderboardItemWithEnriched[]
  endedLeaderboards: LeaderboardItemWithEnriched[]
  isLoading: boolean
  error: Error | null
  showPartner: boolean
  setShowPartner: (showPartner: boolean) => void
}

const LeaderboardContext = createContext<LeaderboardContextValue | undefined>(undefined)

interface LeaderboardProviderProps {
  children: ReactNode
  onPlayNow?: (event: PlayNowEvent) => void
  initialShowPartner?: boolean
}

export function LeaderboardProvider({
  children,
  onPlayNow,
  initialShowPartner = false,
}: LeaderboardProviderProps) {
  const [showPartner, setShowPartner] = useState(initialShowPartner)
  const { ongoingLeaderboards, endedLeaderboards, isLoading, error } = useLeaderboards(showPartner)

  const contextValue = useMemo(
    () => ({
      onPlayNow,
      ongoingLeaderboards,
      endedLeaderboards,
      isLoading,
      error,
      showPartner,
      setShowPartner,
    }),
    [onPlayNow, ongoingLeaderboards, endedLeaderboards, isLoading, error, showPartner],
  )

  return <LeaderboardContext.Provider value={contextValue}>{children}</LeaderboardContext.Provider>
}

export function useLeaderboardContext() {
  const context = useContext(LeaderboardContext)
  if (!context) {
    throw new Error("useLeaderboardContext must be used within a LeaderboardProvider")
  }
  return context
}
