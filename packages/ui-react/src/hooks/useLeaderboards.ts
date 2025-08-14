import { fetchLeaderboards, LEADERBOARD_STATUS, LEADERBOARD_TYPE } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import { getClaimableAmountFunctionData } from "@betswirl/sdk-core"
import { type Address } from "viem"
import { useReadContracts } from "wagmi"
import { useMemo } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { type LeaderboardItemWithRaw } from "../types/types"
import { mapLeaderboardToItem } from "../utils/leaderboardUtils"

interface UseLeaderboardsResult {
  ongoingLeaderboards: LeaderboardItemWithRaw[]
  endedLeaderboards: LeaderboardItemWithRaw[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch and manage leaderboards data
 * Uses TanStack Query for caching and automatic refetching
 * @param showPartner - Whether to show partner leaderboards
 */
export function useLeaderboards(showPartner: boolean): UseLeaderboardsResult {
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

      const casinoLeaderboards = result.leaderboards.filter(
        (lb) => lb.type === LEADERBOARD_TYPE.CASINO,
      )

      return casinoLeaderboards
    },
    refetchInterval: 30000,
    staleTime: 5 * 60 * 1000,
    enabled: !!publicClient,
  })

  // Build claimable amount calls for finalized leaderboards only
  const finalizedLeaderboards = useMemo(() => {
    return (data ?? []).filter((lb) => lb.status === LEADERBOARD_STATUS.FINALIZED)
  }, [data])

  const claimableContracts = useMemo(() => {
    if (!address) return [] as Array<{
      address: Address
      abi: any
      functionName: string
      args: readonly unknown[]
      chainId: number
    }>
    return finalizedLeaderboards.map((lb) => {
      const fd = getClaimableAmountFunctionData(address as Address, lb.onChainId, appChainId)
      return {
        address: fd.data.to as Address,
        abi: fd.data.abi,
        functionName: fd.data.functionName,
        args: fd.data.args,
        chainId: appChainId,
      }
    })
  }, [finalizedLeaderboards, address, appChainId])

  const { data: claimableResults } = useReadContracts({
    contracts: claimableContracts,
    query: {
      enabled: !!address && claimableContracts.length > 0,
      staleTime: 30_000,
    },
  })

  const claimableById = useMemo(() => {
    const map = new Map<string, bigint>()
    if (claimableResults && finalizedLeaderboards.length === claimableResults.length) {
      finalizedLeaderboards.forEach((lb, idx) => {
        const res = claimableResults[idx]?.result as bigint | undefined
        if (typeof res !== "undefined") {
          map.set(lb.id.toString(), res)
        }
      })
    }
    return map
  }, [claimableResults, finalizedLeaderboards])

  const { ongoingLeaderboards, endedLeaderboards } = useMemo(() => {
    if (!data) {
      return { ongoingLeaderboards: [], endedLeaderboards: [] }
    }

    const itemsWithRaw = data.map((lb): LeaderboardItemWithRaw => ({
      item: mapLeaderboardToItem(lb, address, {
        claimableAmount: claimableById.get(lb.id.toString()),
      }),
      raw: lb,
    }))

    const ongoing = itemsWithRaw.filter((item) =>
      [LEADERBOARD_STATUS.PENDING, LEADERBOARD_STATUS.NOT_STARTED].includes(item.item.status),
    )
    const ended = itemsWithRaw.filter((item) =>
      [LEADERBOARD_STATUS.ENDED, LEADERBOARD_STATUS.FINALIZED, LEADERBOARD_STATUS.EXPIRED].includes(
        item.item.status,
      ),
    )

    return { ongoingLeaderboards: ongoing, endedLeaderboards: ended }
  }, [data, address, claimableById])

  return {
    ongoingLeaderboards,
    endedLeaderboards,
    isLoading,
    error: error as Error | null,
  }
}
