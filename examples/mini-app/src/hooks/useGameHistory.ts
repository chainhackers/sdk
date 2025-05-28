import React, { useState, useEffect, useCallback } from "react"
import {
  fetchBets,
  Bet_OrderBy,
  OrderDirection,
  CasinoBet,
  CasinoChainId,
  formatRawAmount,
  FORMAT_TYPE,
  CASINO_GAME_TYPE,
  formatAmount,
} from "@betswirl/sdk-core"
import { useAccount } from "wagmi"
import { TokenImage } from "@coinbase/onchainkit/token"
import { ETH_TOKEN } from "../lib/tokens"
import { createLogger } from "../lib/logger"
import { toLowerCase } from "../lib/utils"

const logger = createLogger("useGameHistory")

enum HistoryEntryStatus {
  WonBet = "Won bet",
  Busted = "Busted",
}

export interface HistoryEntry {
  id: string
  status: HistoryEntryStatus
  multiplier: number | string
  payoutAmount: number | string
  payoutCurrencyIcon: React.ReactElement
  timestamp: string
}

function formatRelativeTime(timestampSecs: number): string {
  const now = new Date()
  const then = new Date(timestampSecs * 1000)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 0) return "in the future"
  if (diffInSeconds < 5) return "just now"
  if (diffInSeconds < 60) return `~${diffInSeconds}s ago`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `~${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `~${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `~${diffInDays}d ago`
}

export const useGameHistory = (
  gameType: CASINO_GAME_TYPE,
  userAddress?: `0x${string}`,
) => {
  const [gameHistory, setGameHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { chainId } = useAccount()

  const fetchHistoryLogic = useCallback(async () => {
    if (!userAddress || !chainId) {
      setGameHistory([])
      setIsLoading(false)
      logger.error("No user address or chain id", { userAddress, chainId })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchBets(
        { chainId: chainId as CasinoChainId },
        {
          bettor: toLowerCase(userAddress),
          game: gameType,
        },
        undefined,
        undefined,
        { key: Bet_OrderBy.BetTimestamp, order: OrderDirection.Desc },
      )

      if (result.error) {
        throw result.error
      }

      const formattedHistory: HistoryEntry[] = (result.bets || []).map(
        (bet: CasinoBet) => ({
          id: bet.id.toString(),
          status: bet.isWin
            ? HistoryEntryStatus.WonBet
            : HistoryEntryStatus.Busted,
          multiplier: formatAmount(
            bet.formattedPayoutMultiplier,
            FORMAT_TYPE.MINIFY,
          ),
          payoutAmount: formatRawAmount(
            bet.payout,
            bet.token.decimals,
            FORMAT_TYPE.MINIFY,
          ),
          payoutCurrencyIcon: React.createElement(TokenImage, {
            token: ETH_TOKEN,
            size: 18,
          }),
          timestamp: formatRelativeTime(Number(bet.rollTimestampSecs)),
        }),
      )

      setGameHistory(formattedHistory)
      logger.info("Game history fetched", { formattedHistory })
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Failed to fetch game history"),
      )
    } finally {
      setIsLoading(false)
    }
  }, [userAddress, chainId, gameType])

  useEffect(() => {
    fetchHistoryLogic()
  }, [fetchHistoryLogic])

  const refreshHistory = useCallback(async () => {
    await fetchHistoryLogic()
  }, [fetchHistoryLogic])

  return { gameHistory, isLoading, error, refreshHistory }
}
