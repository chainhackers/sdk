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
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { createLogger } from "../lib/logger"
import { toLowerCase } from "../lib/utils"
import { HistoryEntryStatus, TokenWithImage } from "../types/types"
import { useTokens } from "./useTokens"

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

export const useGameHistory = (gameType?: CASINO_GAME_TYPE) => {
  const [rawBets, setRawBets] = useState<CasinoBet[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { chainId, address } = useAccount()
  const { tokens } = useTokens({ onlyActive: false }) // Get all tokens, not just active ones

  const fetchRawBets = useCallback(async () => {
    if (!address || !chainId || !gameType) {
      setRawBets([])
      setIsLoading(false)
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

      setRawBets(result.bets)
      logger.info("Raw bets fetched", { count: result.bets.length })
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch game history"))
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId, gameType])

  const gameHistory = useMemo(() => {
    return rawBets.map((bet: CasinoBet) => {
      const matchingToken = tokens.find(
        (token) => token.symbol === bet.token.symbol && token.address === bet.token.address,
      )

      const tokenWithImage: TokenWithImage = matchingToken || {
        ...bet.token,
        // Use BetSwirl's token image URL pattern as fallback
        image: `https://www.betswirl.com/img/tokens/${bet.token.symbol.toUpperCase()}.svg`,
      }

      return {
        id: bet.id.toString(),
        status: bet.isWin ? HistoryEntryStatus.WonBet : HistoryEntryStatus.Busted,
        multiplier: formatAmount(bet.formattedPayoutMultiplier, FORMAT_TYPE.MINIFY),
        payoutAmount: formatRawAmount(bet.payout, bet.token.decimals, FORMAT_TYPE.MINIFY),
        payoutCurrencyToken: tokenWithImage,
        timestamp: formatRelativeTime(Number(bet.rollTimestampSecs)),
      }
    })
  }, [rawBets, tokens])

  useEffect(() => {
    if (address && chainId) {
      fetchRawBets()
    } else {
      setRawBets([])
      setIsLoading(false)
    }
  }, [fetchRawBets, address, chainId])

  const refreshHistory = useCallback(async () => {
    await fetchRawBets()
  }, [fetchRawBets])

  return { gameHistory, isLoading, error, refreshHistory }
}
