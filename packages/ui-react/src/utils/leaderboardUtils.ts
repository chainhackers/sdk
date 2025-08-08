import {
  type Leaderboard,
  type LeaderboardRanking,
  LEADERBOARD_STATUS,
  type CasinoChainId,
} from "@betswirl/sdk-core"
import { type Address } from "viem"
import type {
  LeaderboardItem,
  LeaderboardOverviewData,
  LeaderboardStatus,
  LeaderboardBadgeStatus,
  LeaderboardUserAction,
  LeaderboardRule,
  RankingEntry,
  TokenWithImage,
} from "../types/types"
import { getTokenImage } from "../lib/utils"

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
 * Convert SDK leaderboard status to badge status
 */
export function mapBadgeStatus(status: LEADERBOARD_STATUS): LeaderboardBadgeStatus {
  switch (status) {
    case LEADERBOARD_STATUS.NOT_STARTED:
    case LEADERBOARD_STATUS.PENDING:
    case LEADERBOARD_STATUS.ENDED:
    case LEADERBOARD_STATUS.FINALIZED:
      return "pending"
    case LEADERBOARD_STATUS.EXPIRED:
      return "expired"
    default:
      return "pending"
  }
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
      (r) => r.bettorAddress.toLowerCase() === userAddress.toLowerCase()
    )

    // If user is in rankings and has a winning position
    if (userRanking && leaderboard.shares && leaderboard.shares.length > 0) {
      const winnerCount = leaderboard.shares.length
      if (userRanking.rank <= winnerCount && userRanking.rank > 0) {
        // Calculate approximate reward (this is simplified, actual calculation may differ)
        const sharePercentage = Number(leaderboard.shares[userRanking.rank - 1]) / 10000
        const prizeAmount = (Number(leaderboard.totalShares) * sharePercentage).toString()

        return {
          type: "claim",
          amount: formatTokenAmount(prizeAmount, leaderboard.token.decimals),
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
 */
export function formatTokenAmount(amount: string | bigint, decimals: number): string {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const wholePart = value / divisor
  const decimalPart = value % divisor

  if (wholePart === 0n && decimalPart > 0n) {
    return "<0.0001"
  }

  const formatted = wholePart.toString()
  if (formatted.length > 6) {
    return `${formatted.slice(0, -6)}M`
  }
  if (formatted.length > 3) {
    return `${formatted.slice(0, -3)}K`
  }

  return formatted
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
    (r) => r.bettorAddress.toLowerCase() === userAddress?.toLowerCase()
  )

  return {
    id: leaderboard.id.toString(),
    rank: userRanking?.rank || 0,
    title: leaderboard.title,
    chainId: leaderboard.chainId as CasinoChainId,
    startDate: leaderboard.startDate.toISOString(),
    endDate: leaderboard.endDate.toISOString(),
    status: mapLeaderboardStatus(leaderboard.status),
    badgeStatus: mapBadgeStatus(leaderboard.status),
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
 * Generate rules text from leaderboard configuration
 */
export function generateRules(leaderboard: Leaderboard): LeaderboardRule[] {
  const rules: LeaderboardRule[] = []

  // Always add the important rule about bet rolling
  rules.push({
    text: "A bet must be placed and rolled (not only placed) before end date to be taken into account in the ranking.",
    isHighlighted: true,
  })

  rules.push({
    text: "The competition is scored using a point system:",
  })

  // Add game-specific rules
  if (leaderboard.casinoRules) {
    const { games, tokens, interval, pointsPerInterval, minValue } = leaderboard.casinoRules

    // Games rule
    const gameNames = games.map(g => g.toLowerCase()).join(" or ")
    const chainName = getChainName(leaderboard.chainId as CasinoChainId)
    rules.push({
      text: `You have to play on the ${gameNames} games and on the chain ${chainName}`,
    })

    // Tokens rule
    const tokenSymbols = tokens.map(t => t.symbol).join(", ")
    rules.push({
      text: `You have to play with ${tokenSymbols} tokens`,
    })

    // Points calculation rule
    const intervalFormatted = formatTokenAmount(interval.toString(), tokens[0]?.decimals || 18)
    rules.push({
      text: `You earn ${pointsPerInterval} points per interval of ${intervalFormatted} ${tokens[0]?.symbol || 'tokens'}`,
    })

    // Add examples
    const example1Amount = Number(interval) * 3
    const example1Points = pointsPerInterval * 3
    rules.push({
      text: `Example 1: You bet ${example1Amount} ${tokens[0]?.symbol} at ${games[0]?.toLowerCase()} ⇒ You earn ${example1Points} points`,
    })

    const example2Amount = Number(interval) * 10.5
    const example2Points = pointsPerInterval * 10
    rules.push({
      text: `Example 2: You bet ${Math.floor(example2Amount)} ${tokens[0]?.symbol} at ${games[1]?.toLowerCase() || games[0]?.toLowerCase()} ⇒ You earn ${example2Points} points`,
    })
  }

  return rules
}

/**
 * Get chain name helper (should be imported from chainUtils but adding here for completeness)
 */
function getChainName(chainId: CasinoChainId): string {
  const chainNames: Record<number, string> = {
    1: "Ethereum",
    56: "BNB Smart Chain",
    137: "Polygon",
    8453: "Base",
    42161: "Arbitrum",
    43114: "Avalanche",
    10: "Optimism",
  }
  return chainNames[chainId] || "Unknown"
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
    (r) => r.bettorAddress.toLowerCase() === userAddress?.toLowerCase()
  )

  // Determine user's prize if they're a winner
  let userPrize = { amount: "0", tokenSymbol: leaderboard.token.symbol }
  if (userRanking && leaderboard.shares && userRanking.rank <= leaderboard.shares.length) {
    const sharePercentage = Number(leaderboard.shares[userRanking.rank - 1]) / 10000
    const prizeAmount = (Number(leaderboard.totalShares) * sharePercentage).toString()
    userPrize = {
      amount: formatTokenAmount(prizeAmount, leaderboard.token.decimals),
      tokenSymbol: leaderboard.token.symbol,
    }
  }

  // Determine user stats status
  let userStatus: LeaderboardOverviewData["userStats"]["status"] = "Ongoing"
  if (leaderboard.status === LEADERBOARD_STATUS.FINALIZED) {
    userStatus = userPrize.amount !== "0" ? "Claimable" : "Finalized"
  } else if (leaderboard.status === LEADERBOARD_STATUS.EXPIRED) {
    userStatus = "Finalized"
  }

  return {
    ...baseItem,
    userStats: {
      status: userStatus,
      position: userRanking?.rank || 0,
      points: Number(userRanking?.totalPoints || 0),
      prize: userPrize,
      contractAddress: leaderboard.leaderboardAddress || "0x0000000000000000000000000000000000000000",
    },
    rules: generateRules(leaderboard),
    isExpired: leaderboard.status === LEADERBOARD_STATUS.EXPIRED,
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
    const sharePercentage = Number(leaderboard.shares[ranking.rank - 1]) / 10000
    const prizeAmount = (Number(leaderboard.totalShares) * sharePercentage).toString()
    rewardAmount = formatTokenAmount(prizeAmount, leaderboard.token.decimals)
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
