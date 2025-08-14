import { LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { type LeaderboardItemWithEnriched } from "../types/types"
import { mapLeaderboardToItem } from "../utils/leaderboardUtils"
import { fetchAndEnrichLeaderboards, type EnrichedLeaderboard } from "../data/leaderboardQueries"

interface UseLeaderboardsResult {
  ongoingLeaderboards: LeaderboardItemWithEnriched[]
  endedLeaderboards: LeaderboardItemWithEnriched[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch and manage leaderboards data
 * Uses TanStack Query for caching and automatic refetching
 * This hook serves as the Single Source of Truth (SSoT) for all leaderboards data
 * @param showPartner - Whether to show partner leaderboards
 */
export function useLeaderboards(showPartner: boolean): UseLeaderboardsResult {
  const { appChainId } = useChain()
  const { affiliate } = useBettingConfig()
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: appChainId })

  // Main query that fetches and enriches all leaderboards data
  // This becomes our SSoT for leaderboards in the cache
  const { data: enrichedLeaderboards, isLoading, error } = useQuery({
    queryKey: ["leaderboards", appChainId, address, showPartner],
    queryFn: async (): Promise<EnrichedLeaderboard[]> => {
      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      return fetchAndEnrichLeaderboards({
        publicClient,
        chainId: appChainId,
        address,
        affiliate,
        showPartner,
      })
    },
    refetchInterval: 30000,
    enabled: !!publicClient,
  })

  // Transform enriched data into UI models and categorize
  if (!enrichedLeaderboards) {
    return {
      ongoingLeaderboards: [],
      endedLeaderboards: [],
      isLoading,
      error: error as Error | null,
    }
  }

  const itemsWithEnriched = enrichedLeaderboards.map((enriched): LeaderboardItemWithEnriched => ({
    item: mapLeaderboardToItem(enriched, address, {
      claimableAmount: enriched.claimableAmount,
    }),
    enriched,
  }))

  const ongoingLeaderboards = itemsWithEnriched.filter((item) =>
    [LEADERBOARD_STATUS.PENDING, LEADERBOARD_STATUS.NOT_STARTED].includes(item.item.status),
  )
  const endedLeaderboards = itemsWithEnriched.filter((item) =>
    [LEADERBOARD_STATUS.ENDED, LEADERBOARD_STATUS.FINALIZED, LEADERBOARD_STATUS.EXPIRED].includes(
      item.item.status,
    ),
  )

  return {
    ongoingLeaderboards,
    endedLeaderboards,
    isLoading,
    error: error as Error | null,
  }
}
