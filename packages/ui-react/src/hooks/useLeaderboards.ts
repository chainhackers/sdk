import {
  fetchLeaderboards,
  LEADERBOARD_STATUS,
  type BetSwirlWallet,
} from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { mapLeaderboardToItem } from "../utils/leaderboardUtils"
import { type LeaderboardItem } from "../types/types"

interface UseLeaderboardsResult {
  ongoingLeaderboards: LeaderboardItem[]
  endedLeaderboards: LeaderboardItem[]
  showPartner: boolean
  setShowPartner: (show: boolean) => void
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch and manage leaderboards data
 * Uses TanStack Query for caching and automatic refetching
 */
export function useLeaderboards(): UseLeaderboardsResult {
  const [showPartner, setShowPartner] = useState(false)
  const { appChainId } = useChain()
  const { affiliate } = useBettingConfig()
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: appChainId })

  // Fetch leaderboards using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboards", appChainId, address, showPartner],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      // Create a minimal wallet wrapper for SDK functions
      const wallet = { publicClient } as unknown as BetSwirlWallet

      // Fetch leaderboards from the API
      // Parameters: limit, offset, playerAddress, affiliate, chainId, withExternalBankrollLeaderboards
      const result = await fetchLeaderboards(
        100, // limit - get up to 100 leaderboards
        0,   // offset - start from the beginning
        address, // player address for personalized data
        showPartner ? undefined : affiliate, // filter by affiliate if not showing partner boards
        appChainId, // current chain
        showPartner, // include external bankroll leaderboards
        "desc", // sort by end date descending (newest first)
        undefined, // no status filter - get all statuses
        false // not test mode
      )

      // Convert SDK leaderboards to UI format
      return result.leaderboards.map(lb => mapLeaderboardToItem(lb, address))
    },
    // Refetch every 30 seconds to keep data fresh
    refetchInterval: 30000,
    // Keep data in cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    enabled: !!publicClient,
  })

  // Separate leaderboards by status
  const { ongoingLeaderboards, endedLeaderboards } = useMemo(() => {
    if (!data) {
      return { ongoingLeaderboards: [], endedLeaderboards: [] }
    }

    const ongoing = data.filter((lb) => lb.status === "ongoing")
    const ended = data.filter((lb) => lb.status === "ended")

    return { ongoingLeaderboards: ongoing, endedLeaderboards: ended }
  }, [data])

  return {
    ongoingLeaderboards,
    endedLeaderboards,
    showPartner,
    setShowPartner,
    isLoading,
    error: error as Error | null,
  }
}
