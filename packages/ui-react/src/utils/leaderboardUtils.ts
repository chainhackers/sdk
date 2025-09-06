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
  LeaderboardItem,
  LeaderboardOverviewData,
  LeaderboardUserAction,
  RankingEntry,
  TokenWithImage,
} from "../types/types"

/**
 * Format raw leaderboard status for UI badges/text
 */
export function formatLeaderboardStatus(status: LEADERBOARD_STATUS): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Determine user action based on leaderboard status and user data
 */
export function determineUserAction(
  leaderboard: Leaderboard,
  userAddress?: Address,
  options?: { claimableAmount?: bigint },
): LeaderboardUserAction {
  if (!userAddress) {
    return { type: "overview" }
  }

  const claimableAmount = options?.claimableAmount

  if (leaderboard.status === LEADERBOARD_STATUS.FINALIZED) {
    const userRanking = leaderboard.rankings?.find(
      (r) => r.bettorAddress.toLowerCase() === userAddress.toLowerCase(),
    )

    if (userRanking && leaderboard.shares && leaderboard.shares.length > 0) {
      const winnerCount = leaderboard.shares.length
      if (userRanking.rank <= winnerCount && userRanking.rank > 0) {
        const rewardAmount = leaderboard.shares[userRanking.rank - 1]
        const formattedAmount = formatTokenAmount(rewardAmount, leaderboard.token.decimals)

        if (claimableAmount) {
          return {
            type: "claim",
            amount: formattedAmount,
            tokenSymbol: leaderboard.token.symbol,
          }
        }

        return {
          type: "claimed",
          amount: formattedAmount,
          tokenSymbol: leaderboard.token.symbol,
        }
      }
    }
  }

  if (leaderboard.status === LEADERBOARD_STATUS.PENDING) {
    return { type: "play" }
  }

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
  options?: { claimableAmount?: bigint },
): LeaderboardItem {
  const token: TokenWithImage = {
    address: leaderboard.token.address,
    symbol: leaderboard.token.symbol,
    decimals: leaderboard.token.decimals,
    image: getTokenImage(leaderboard.token.symbol),
  }

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
    status: leaderboard.status,
    prize: {
      token,
      amount: formatTokenAmount(leaderboard.totalShares, leaderboard.token.decimals),
    },
    participants: leaderboard.totalBettors || 0,
    isPartner: !!leaderboard.affiliateAddress,
    userAction: determineUserAction(leaderboard, userAddress, options),
  }
}

/**
 * Convert SDK Leaderboard to UI LeaderboardOverviewData
 */
export function mapLeaderboardToOverviewData(
  leaderboard: Leaderboard,
  userAddress?: Address,
  options?: { claimableAmount?: bigint },
): LeaderboardOverviewData {
  const baseItem = mapLeaderboardToItem(leaderboard, userAddress, options)

  const userRanking = leaderboard.rankings?.find(
    (r) => r.bettorAddress.toLowerCase() === userAddress?.toLowerCase(),
  )

  let userPrize = { amount: "0", tokenSymbol: leaderboard.token.symbol }
  if (userRanking && leaderboard.shares && userRanking.rank <= leaderboard.shares.length) {
    const rewardAmount = leaderboard.shares[userRanking.rank - 1]
    userPrize = {
      amount: formatTokenAmount(rewardAmount, leaderboard.token.decimals),
      tokenSymbol: leaderboard.token.symbol,
    }
  }

  return {
    ...baseItem,
    userStats: {
      status: leaderboard.status,
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

  let rewardAmount = "0"
  if (leaderboard.shares && ranking.rank <= leaderboard.shares.length && ranking.rank > 0) {
    const rewardValue = leaderboard.shares[ranking.rank - 1]
    rewardAmount = formatTokenAmount(rewardValue, leaderboard.token.decimals)
  }

  return {
    rank: ranking.rank,
    playerAddress: ranking.bettorAddress,
    points: Number(ranking.totalPoints),
    rewardAmount,
    rewardToken: token,
  }
}

/**
 * Format address for UI display with ellipsis
 */
export function formatAddress(address: Address): string {
  const addressStr = address.toLowerCase()
  if (addressStr.length <= 10) return addressStr
  return `${addressStr.slice(0, 6)}...${addressStr.slice(-6)}`
}
