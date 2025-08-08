import {
  fetchLeaderboard,
  type BetSwirlWallet,
} from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { mapLeaderboardToOverviewData } from "../utils/leaderboardUtils"
import { type LeaderboardOverviewData } from "../types/types"

/**
 * Hook to fetch detailed leaderboard data including user stats and rules
 * Uses TanStack Query for caching and automatic refetching
 */
export function useLeaderboardDetails(leaderboardId: string | null): {
  data: LeaderboardOverviewData | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const { appChainId } = useChain()
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: appChainId })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboardDetails", leaderboardId, address],
    queryFn: async () => {
      if (!leaderboardId) {
        return null
      }

      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      // Create a minimal wallet wrapper for SDK functions
      const wallet = { publicClient } as unknown as BetSwirlWallet

      // Fetch detailed leaderboard data from the API
      const leaderboard = await fetchLeaderboard(
        Number(leaderboardId), // leaderboard ID
        address, // player address for personalized data
        false // not test mode
      )

      if (!leaderboard) {
        throw new Error(`Leaderboard ${leaderboardId} not found`)
      }

      // Convert SDK leaderboard to UI overview format
      return mapLeaderboardToOverviewData(leaderboard, address)
    },
    // Only fetch if we have a leaderboard ID and public client
    enabled: !!leaderboardId && !!publicClient,
    // Refetch every 30 seconds to keep data fresh
    refetchInterval: 30000,
    // Keep data in cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
