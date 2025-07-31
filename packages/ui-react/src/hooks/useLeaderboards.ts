import { type CasinoChainId } from "@betswirl/sdk-core"
import { useMemo, useState } from "react"
import { getTokenImage } from "../lib/utils"
import { type LeaderboardItem, type TokenWithImage } from "../types/types"

interface UseLeaderboardsResult {
  ongoingLeaderboards: LeaderboardItem[]
  endedLeaderboards: LeaderboardItem[]
  showPartner: boolean
  setShowPartner: (show: boolean) => void
  isLoading: boolean
  error: Error | null
}

// Mock token data
const MOCK_BETS_TOKEN: TokenWithImage = {
  address: "0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5",
  symbol: "BETS",
  decimals: 18,
  image: getTokenImage("BETS"),
}

// Mock leaderboard data
const MOCK_LEADERBOARDS: LeaderboardItem[] = [
  {
    id: "1",
    rank: 1,
    title: "Avalanche - July",
    chainId: 43114 as CasinoChainId, // Avalanche
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ongoing",
    badgeStatus: "pending",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 175,
    isPartner: false,
    userAction: { type: "play" },
  },
  {
    id: "2",
    rank: 2,
    title: "Ethereum - July",
    chainId: 1 as CasinoChainId, // Ethereum
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ongoing",
    badgeStatus: "pending",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 1756,
    isPartner: false,
    userAction: { type: "claim", amount: "0.0001", tokenSymbol: "Avax" },
  },
  {
    id: "3",
    rank: 1,
    title: "BNB - July",
    chainId: 56 as CasinoChainId, // BNB Smart Chain
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ongoing",
    badgeStatus: "pending",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 175234,
    isPartner: false,
    userAction: { type: "play" },
  },
  {
    id: "4",
    rank: 1,
    title: "Ethereum - July",
    chainId: 1 as CasinoChainId, // Ethereum
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ended",
    badgeStatus: "expired",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 17500,
    isPartner: false,
    userAction: { type: "overview" },
  },
  {
    id: "5",
    rank: 1,
    title: "Avalanche - July",
    chainId: 43114 as CasinoChainId, // Avalanche
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ended",
    badgeStatus: "expired",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 175,
    isPartner: false,
    userAction: { type: "overview" },
  },
  {
    id: "6",
    rank: 1,
    title: "BNB - July",
    chainId: 56 as CasinoChainId, // BNB Smart Chain
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ended",
    badgeStatus: "expired",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "5000000",
    },
    participants: 17,
    isPartner: false,
    userAction: { type: "overview" },
  },
  {
    id: "7",
    rank: 1,
    title: "Partner Leaderboard - Special",
    chainId: 137 as CasinoChainId, // Polygon
    startDate: "2024-07-01T00:00:00Z",
    endDate: "2024-07-31T00:00:00Z",
    status: "ongoing",
    badgeStatus: "pending",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "10000000",
    },
    participants: 500,
    isPartner: true,
    userAction: { type: "play" },
  },
  {
    id: "8",
    rank: 3,
    title: "Arbitrum - July",
    chainId: 42161 as CasinoChainId, // Arbitrum
    startDate: "2024-07-09T00:00:00Z",
    endDate: "2024-08-09T00:00:00Z",
    status: "ongoing",
    badgeStatus: "pending",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "3000000",
    },
    participants: 892,
    isPartner: false,
    userAction: { type: "play" },
  },
  {
    id: "9",
    rank: 1,
    title: "Optimism - June",
    chainId: 10 as CasinoChainId, // Optimism
    startDate: "2024-06-01T00:00:00Z",
    endDate: "2024-06-30T00:00:00Z",
    status: "ended",
    badgeStatus: "expired",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "7500000",
    },
    participants: 3421,
    isPartner: false,
    userAction: { type: "overview" },
  },
  {
    id: "10",
    rank: 2,
    title: "Base - June",
    chainId: 8453 as CasinoChainId, // Base
    startDate: "2024-06-01T00:00:00Z",
    endDate: "2024-06-30T00:00:00Z",
    status: "ended",
    badgeStatus: "expired",
    prize: {
      token: MOCK_BETS_TOKEN,
      amount: "2500000",
    },
    participants: 1234,
    isPartner: false,
    userAction: { type: "overview" },
  },
]

export function useLeaderboards(): UseLeaderboardsResult {
  const [showPartner, setShowPartner] = useState(false)
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  const { ongoingLeaderboards, endedLeaderboards } = useMemo(() => {
    const filteredLeaderboards = showPartner
      ? MOCK_LEADERBOARDS
      : MOCK_LEADERBOARDS.filter((lb) => !lb.isPartner)

    const ongoing = filteredLeaderboards.filter((lb) => lb.status === "ongoing")
    const ended = filteredLeaderboards.filter((lb) => lb.status === "ended")

    return { ongoingLeaderboards: ongoing, endedLeaderboards: ended }
  }, [showPartner])

  return {
    ongoingLeaderboards,
    endedLeaderboards,
    showPartner,
    setShowPartner,
    isLoading,
    error,
  }
}
