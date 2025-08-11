import {
  type CasinoChainId,
  FORMAT_TYPE,
  formatRawAmount,
  LEADERBOARD_STATUS,
  type Leaderboard,
  type LeaderboardRanking,
} from "@betswirl/sdk-core"
import { type Address } from "viem"
import { getTokenImage } from "../lib/utils"
import type {
  LeaderboardDisplayStatus,
  LeaderboardItem,
  LeaderboardOverviewData,
  LeaderboardStatus,
  LeaderboardUserAction,
  RankingEntry,
  TokenWithImage,
} from "../types/types"

/**
 * Convert SDK leaderboard status to UI status
 */
export function mapLeaderboardStatus(status: LEADERBOARD_STATUS): LeaderboardStatus {
  switch (status) {
    case LEADERBOARD_STATUS.NOT_STARTED:
    case LEADERBOARD_STATUS.PENDING:
      return "ongoing"
    case LEADERBOARD_STATUS.ENDED:
    case LEADERBOARD_STATUS.FINALIZED:
    case LEADERBOARD_STATUS.EXPIRED:
      return "ended"
    default:
      return "ended"
  }
}

/**
 * Get unified display status for leaderboard in UI components
 * This is the single source of truth for status mapping
 */
export function getLeaderboardDisplayStatus(
  leaderboard: Leaderboard,
  userAddress?: Address,
): LeaderboardDisplayStatus {
  // Handle expired status first
  if (leaderboard.status === LEADERBOARD_STATUS.EXPIRED) {
    return "Expired"
  }

  // Handle finalized status
  if (leaderboard.status === LEADERBOARD_STATUS.FINALIZED) {
    // Check if user can claim rewards
    if (userAddress) {
      const userRanking = leaderboard.rankings?.find(
        (r) => r.bettorAddress.toLowerCase() === userAddress.toLowerCase(),
      )

      if (
        userRanking &&
        leaderboard.shares &&
        userRanking.rank <= leaderboard.shares.length &&
        userRanking.rank > 0
      ) {
        const rewardAmount = leaderboard.shares[userRanking.rank - 1]
        if (rewardAmount > 0n) {
          return "Claimable"
        }
      }
    }
    return "Finalized"
  }

  // Handle ongoing status (PENDING, NOT_STARTED, ENDED)
  if (
    leaderboard.status === LEADERBOARD_STATUS.PENDING ||
    leaderboard.status === LEADERBOARD_STATUS.NOT_STARTED ||
    leaderboard.status === LEADERBOARD_STATUS.ENDED
  ) {
    return "Ongoing"
  }

  // Default fallback
  return "Finalized"
}

/**
 * Determine user action based on leaderboard status and user data
 */
export function determineUserAction(
  leaderboard: Leaderboard,
  userAddress?: Address,
): LeaderboardUserAction {
  // If user is not connected, show overview
  if (!userAddress) {
    return { type: "overview" }
  }

  // Check if user can claim rewards
  if (leaderboard.status === LEADERBOARD_STATUS.FINALIZED) {
    const userRanking = leaderboard.rankings?.find(
      (r) => r.bettorAddress.toLowerCase() === userAddress.toLowerCase(),
    )

    // If user is in rankings and has a winning position
    if (userRanking && leaderboard.shares && leaderboard.shares.length > 0) {
      const winnerCount = leaderboard.shares.length
      if (userRanking.rank <= winnerCount && userRanking.rank > 0) {
        // The shares array already contains the reward amounts in smallest units
        // No need to calculate percentage - shares[rank-1] IS the reward amount
        const rewardAmount = leaderboard.shares[userRanking.rank - 1]

        return {
          type: "claim",
          amount: formatTokenAmount(rewardAmount, leaderboard.token.decimals),
          tokenSymbol: leaderboard.token.symbol,
        }
      }
    }
  }

  // If leaderboard is active, show play button
  if (leaderboard.status === LEADERBOARD_STATUS.PENDING) {
    return { type: "play" }
  }

  // Default to overview for ended/expired leaderboards
  return { type: "overview" }
}

/**
 * Format token amount for display
 * Uses SDK's formatRawAmount for consistent formatting across the app
 */
function formatTokenAmount(amount: bigint, decimals: number): string {
  return formatRawAmount(amount, decimals, FORMAT_TYPE.MINIFY)
}

/**
 * Convert SDK Leaderboard to UI LeaderboardItem
 */
export function mapLeaderboardToItem(
  leaderboard: Leaderboard,
  userAddress?: Address,
): LeaderboardItem {
  const token: TokenWithImage = {
    address: leaderboard.token.address,
    symbol: leaderboard.token.symbol,
    decimals: leaderboard.token.decimals,
    image: getTokenImage(leaderboard.token.symbol),
  }

  // Find user's ranking if they're in the leaderboard
  const userRanking = leaderboard.rankings?.find(
    (r) => r.bettorAddress.toLowerCase() === userAddress?.toLowerCase(),
  )

  return {
    id: leaderboard.id.toString(),
    userRank: userRanking?.rank ?? null,
    title: leaderboard.title,
    chainId: leaderboard.chainId as CasinoChainId,
    startDate: leaderboard.startDate.toISOString(),
    endDate: leaderboard.endDate.toISOString(),
    status: mapLeaderboardStatus(leaderboard.status),
    prize: {
      token,
      amount: formatTokenAmount(leaderboard.totalShares, leaderboard.token.decimals),
    },
    participants: leaderboard.totalBettors || 0,
    isPartner: !!leaderboard.affiliateAddress,
    userAction: determineUserAction(leaderboard, userAddress),
  }
}

/**
 * Convert SDK Leaderboard to UI LeaderboardOverviewData
 */
export function mapLeaderboardToOverviewData(
  leaderboard: Leaderboard,
  userAddress?: Address,
): LeaderboardOverviewData {
  const baseItem = mapLeaderboardToItem(leaderboard, userAddress)

  // Find user's ranking
  const userRanking = leaderboard.rankings?.find(
    (r) => r.bettorAddress.toLowerCase() === userAddress?.toLowerCase(),
  )

  // Determine user's prize if they're a winner
  let userPrize = { amount: "0", tokenSymbol: leaderboard.token.symbol }
  if (userRanking && leaderboard.shares && userRanking.rank <= leaderboard.shares.length) {
    // The shares array already contains the reward amounts in smallest units
    // No need to calculate percentage - shares[rank-1] IS the reward amount
    const rewardAmount = leaderboard.shares[userRanking.rank - 1]
    userPrize = {
      amount: formatTokenAmount(rewardAmount, leaderboard.token.decimals),
      tokenSymbol: leaderboard.token.symbol,
    }
  }

  // Use the new unified status function
  const userStatus = getLeaderboardDisplayStatus(leaderboard, userAddress)

  return {
    ...baseItem,
    userStats: {
      status: userStatus,
      position: userRanking?.rank || 0,
      points: Number(userRanking?.totalPoints || 0),
      prize: userPrize,
      contractAddress:
        leaderboard.leaderboardAddress || "0x0000000000000000000000000000000000000000",
    },
  }
}

/**
 * Convert SDK LeaderboardRanking to UI RankingEntry
 */
export function mapRankingToEntry(
  ranking: LeaderboardRanking,
  leaderboard: Leaderboard,
): RankingEntry {
  const token: TokenWithImage = {
    address: leaderboard.token.address,
    symbol: leaderboard.token.symbol,
    decimals: leaderboard.token.decimals,
    image: getTokenImage(leaderboard.token.symbol),
  }

  // Calculate reward amount based on rank and shares
  let rewardAmount = "0"
  if (leaderboard.shares && ranking.rank <= leaderboard.shares.length && ranking.rank > 0) {
    // The shares array already contains the reward amounts in smallest units
    // No need to calculate percentage - shares[rank-1] IS the reward amount
    const rewardValue = leaderboard.shares[ranking.rank - 1]
    rewardAmount = formatTokenAmount(rewardValue, leaderboard.token.decimals)
  }

  // Format player address for display
  const playerAddress = `${ranking.bettorAddress.slice(0, 8)}...${ranking.bettorAddress.slice(-7)}`

  return {
    rank: ranking.rank,
    playerAddress,
    points: Number(ranking.totalPoints),
    rewardAmount,
    rewardToken: token,
  }
}
