import { fetchLeaderboard } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { type LeaderboardOverviewData } from "../types/types"
import { mapLeaderboardToOverviewData } from "../utils/leaderboardUtils"

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

      const leaderboard = await fetchLeaderboard(Number(leaderboardId), address)

      if (!leaderboard) {
        throw new Error(`Leaderboard ${leaderboardId} not found`)
      }

      return mapLeaderboardToOverviewData(leaderboard, address)
    },
    enabled: !!leaderboardId && !!publicClient,
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
