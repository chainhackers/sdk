import { fetchLeaderboard, getClaimableAmountFunctionData, LEADERBOARD_STATUS, type Leaderboard } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useAccount, usePublicClient, useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { type LeaderboardOverviewData } from "../types/types"
import { mapLeaderboardToOverviewData } from "../utils/leaderboardUtils"

/**
 * Hook to fetch detailed leaderboard data including user stats and rules
 * Uses TanStack Query for caching and automatic refetching
 */
export function useLeaderboardDetails(leaderboardId: string | null): {
  data: { overview: LeaderboardOverviewData; raw: Leaderboard } | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const { appChainId } = useChain()
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: appChainId })

  // First, fetch the leaderboard data
  const { data: rawLeaderboard, isLoading: isLoadingRaw, error: errorRaw, refetch: refetchRaw } = useQuery({
    queryKey: ["leaderboard", leaderboardId, address],
    queryFn: async () => {
      if (!leaderboardId) {
        return null
      }

      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      const leaderboard = await fetchLeaderboard(Number(leaderboardId), address, true)

      if (!leaderboard) {
        throw new Error(`Leaderboard ${leaderboardId} not found`)
      }

      return leaderboard
    },
    enabled: !!leaderboardId && !!publicClient,
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
  })

  // For finalized leaderboards, get claimable amount
  const claimableFunctionData = rawLeaderboard && address && rawLeaderboard.status === LEADERBOARD_STATUS.FINALIZED
    ? getClaimableAmountFunctionData(address, rawLeaderboard.onChainId, appChainId)
    : null

  const { data: claimableAmount } = useReadContract({
    abi: claimableFunctionData?.data.abi,
    address: claimableFunctionData?.data.to,
    functionName: claimableFunctionData?.data.functionName,
    args: claimableFunctionData?.data.args,
    chainId: appChainId,
    query: {
      enabled: !!claimableFunctionData,
      staleTime: 30_000,
    },
  })

  // Combine the data
  const combinedData = rawLeaderboard ? {
    overview: mapLeaderboardToOverviewData(rawLeaderboard, address, {
      claimableAmount: claimableAmount as bigint | undefined
    }),
    raw: rawLeaderboard
  } : null

  return {
    data: combinedData,
    isLoading: isLoadingRaw,
    error: errorRaw as Error | null,
    refetch: refetchRaw,
  }
}
