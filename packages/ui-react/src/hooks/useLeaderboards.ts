import { fetchLeaderboards, LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { type LeaderboardItem } from "../types/types"
import { mapLeaderboardToItem } from "../utils/leaderboardUtils"

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboards", appChainId, address, showPartner],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      const result = await fetchLeaderboards(
        100,
        0,
        address,
        showPartner ? undefined : affiliate,
        appChainId,
        showPartner,
        "desc",
        undefined,
        true,
      )

      return result.leaderboards.map((lb) => mapLeaderboardToItem(lb, address))
    },
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
    enabled: !!publicClient,
  })

  const { ongoingLeaderboards, endedLeaderboards } = useMemo(() => {
    if (!data) {
      return { ongoingLeaderboards: [], endedLeaderboards: [] }
    }

    const ongoing = data.filter((lb) =>
      [LEADERBOARD_STATUS.PENDING, LEADERBOARD_STATUS.NOT_STARTED].includes(lb.status),
    )
    const ended = data.filter((lb) =>
      [LEADERBOARD_STATUS.ENDED, LEADERBOARD_STATUS.FINALIZED, LEADERBOARD_STATUS.EXPIRED].includes(
        lb.status,
      ),
    )

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
