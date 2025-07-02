import {
  Bet_OrderBy,
  CASINO_GAME_TYPE,
  CasinoBet,
  CasinoChainId,
  FORMAT_TYPE,
  fetchBets,
  formatAmount,
  formatRawAmount,
  OrderDirection,
} from "@betswirl/sdk-core"
import React, { useCallback, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { TokenIcon } from "../components/ui/TokenIcon"
import { useBettingConfig } from "../context/configContext"
import { createLogger } from "../lib/logger"
import { toLowerCase } from "../lib/utils"
import { HistoryEntry, HistoryEntryStatus, TokenWithImage } from "../types/types"

const logger = createLogger("useGameHistory")

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

export const useGameHistory = (gameType: CASINO_GAME_TYPE) => {
  const [gameHistory, setGameHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { chainId, address } = useAccount()
  const { bankrollToken } = useBettingConfig()

  const fetchHistoryLogic = useCallback(async () => {
    if (!address || !chainId) {
      setGameHistory([])
      setIsLoading(false)
      logger.error("No user address or chain id", { address, chainId })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchBets(
        { chainId: chainId as CasinoChainId },
        {
          bettor: toLowerCase(address),
          game: gameType,
        },
        undefined,
        undefined,
        { key: Bet_OrderBy.BetTimestamp, order: OrderDirection.Desc },
      )

      if (result.error) {
        throw result.error
      }

      const formattedHistory: HistoryEntry[] = result.bets.map((bet: CasinoBet) => {
        // TODO: Implement proper dynamic token loading for all supported tokens #107
        // For now, dynamically generate token image URL based on symbol
        const tokenWithImage: TokenWithImage =
          bankrollToken && bankrollToken.symbol === bet.token.symbol
            ? bankrollToken
            : {
                ...bet.token,
                // Use BetSwirl's token image URL pattern
                image: `https://www.betswirl.com/img/tokens/${bet.token.symbol.toUpperCase()}.svg`,
              }

        return {
          id: bet.id.toString(),
          status: bet.isWin ? HistoryEntryStatus.WonBet : HistoryEntryStatus.Busted,
          multiplier: formatAmount(bet.formattedPayoutMultiplier, FORMAT_TYPE.MINIFY),
          payoutAmount: formatRawAmount(bet.payout, bet.token.decimals, FORMAT_TYPE.MINIFY),
          payoutCurrencyIcon: React.createElement(TokenIcon, {
            token: tokenWithImage,
            size: 18,
          }),
          timestamp: formatRelativeTime(Number(bet.rollTimestampSecs)),
        }
      })

      setGameHistory(formattedHistory)
      logger.info("Game history fetched", { formattedHistory })
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch game history"))
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId, gameType, bankrollToken])

  useEffect(() => {
    fetchHistoryLogic()
  }, [fetchHistoryLogic])

  const refreshHistory = useCallback(async () => {
    await fetchHistoryLogic()
  }, [fetchHistoryLogic])

  return { gameHistory, isLoading, error, refreshHistory }
}
