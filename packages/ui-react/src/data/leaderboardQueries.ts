import {
  type CasinoChainId,
  fetchLeaderboard,
  fetchLeaderboards,
  getClaimableAmountFunctionData,
  LEADERBOARD_STATUS,
  LEADERBOARD_TYPE,
  type Leaderboard,
} from "@betswirl/sdk-core"
import type { Address, PublicClient } from "viem"

export type EnrichedLeaderboard = Leaderboard & {
  claimableAmount?: bigint
}

export interface LeaderboardQueryDeps {
  publicClient: PublicClient
  chainId: CasinoChainId
  address?: Address
  affiliate?: Address
}

export interface FetchLeaderboardsParams extends LeaderboardQueryDeps {
  showPartner: boolean
}

export async function fetchAndEnrichLeaderboards({
  publicClient,
  chainId,
  address,
  affiliate,
  showPartner,
}: FetchLeaderboardsParams): Promise<EnrichedLeaderboard[]> {
  const result = await fetchLeaderboards(
    100,
    0,
    address,
    showPartner ? undefined : affiliate,
    chainId,
    showPartner,
    "desc",
    undefined,
    true,
  )

  const casinoLeaderboards = result.leaderboards.filter((lb) => lb.type === LEADERBOARD_TYPE.CASINO)

  if (!address) {
    return casinoLeaderboards
  }

  const finalizedLeaderboards = casinoLeaderboards.filter(
    (lb) => lb.status === LEADERBOARD_STATUS.FINALIZED,
  )

  if (finalizedLeaderboards.length === 0) {
    return casinoLeaderboards
  }

  const calls = finalizedLeaderboards.map((lb) => {
    const functionData = getClaimableAmountFunctionData(
      address,
      lb.onChainId,
      chainId as CasinoChainId,
    )
    return {
      address: functionData.data.to as Address,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    }
  })

  const results = await publicClient.multicall({
    contracts: calls,
  })

  const enrichedLeaderboards: EnrichedLeaderboard[] = casinoLeaderboards.map((lb) => {
    const finalizedIndex = finalizedLeaderboards.findIndex(
      (finalizedLb) => finalizedLb.id === lb.id,
    )

    if (finalizedIndex >= 0 && results[finalizedIndex]?.status === "success") {
      return {
        ...lb,
        claimableAmount: results[finalizedIndex].result as bigint,
      }
    }

    return lb
  })

  return enrichedLeaderboards
}

export async function fetchAndEnrichSingleLeaderboard(
  leaderboardId: string,
  deps: LeaderboardQueryDeps,
): Promise<EnrichedLeaderboard> {
  const { publicClient, chainId, address } = deps

  const leaderboard = await fetchLeaderboard(Number(leaderboardId), address, true)

  if (!leaderboard) {
    throw new Error(`Leaderboard ${leaderboardId} not found`)
  }

  if (!address || leaderboard.status !== LEADERBOARD_STATUS.FINALIZED) {
    return leaderboard
  }

  try {
    const functionData = getClaimableAmountFunctionData(
      address,
      leaderboard.onChainId,
      chainId as CasinoChainId,
    )
    const claimableAmount = await publicClient.readContract({
      address: functionData.data.to as Address,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      args: functionData.data.args,
    })

    return {
      ...leaderboard,
      claimableAmount: claimableAmount as bigint,
    }
  } catch (error) {
    console.warn(`Failed to fetch claimable amount for leaderboard ${leaderboardId}:`, error)
    return leaderboard
  }
}
