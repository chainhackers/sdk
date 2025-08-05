import { useMemo } from "react"
import { type LeaderboardOverviewData, type TokenWithImage } from "../types/types"

// Temporary mock hook to provide leaderboard overview data
export function useLeaderboardDetails(leaderboardId: string | null): {
  data: LeaderboardOverviewData | null
  isLoading: boolean
} {
  const isLoading = false

  const data = useMemo<LeaderboardOverviewData | null>(() => {
    if (!leaderboardId) return null

    const avaxToken: TokenWithImage = {
      symbol: "Avax",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      image: "https://www.betswirl.com/img/tokens/AVAX.svg",
    } as any

    // Simple mocked item matching list structure and enriched for overview
    return {
      id: leaderboardId,
      rank: 1,
      title: "Avalanche - July",
      chainId: 43114 as any,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: "ended",
      badgeStatus: "expired",
      prize: { token: avaxToken, amount: "<0.0001" },
      participants: 1234,
      isPartner: false,
      userAction: { type: "overview" },
      userStats: {
        status: "Finalized",
        position: 1,
        points: 10,
        prize: { amount: "<0.0001", tokenSymbol: "Avax" },
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
      rules: [
        { text: "A bet must be placed and rolled (not only placed) before end date to be taken into account in the ranking.", isHighlighted: true },
        { text: "The competition is scored using a point system:" },
        { text: "You have to play on the dice or cointoss or roulette or keno or wheel games and on the chain Base" },
        { text: "You have to play with BETS tokens" },
        { text: "You earn 100 points per interval of 100 BETS" },
        { text: "Example 1: You bet 300 BETS at dice ⇒ You earn 300 points" },
        { text: "Example 2: You bet 1050 BETS at cointoss ⇒ You earn 1000 points" },
      ],
      isExpired: true,
    }
  }, [leaderboardId])

  return { data, isLoading }
}
