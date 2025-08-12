import { LEADERBOARD_TYPE, refreshLeaderboardsWithBets, type CasinoChainId } from "@betswirl/sdk-core"
import { useEffect } from "react"
import { createLogger } from "../lib/logger"
import type { GameResult } from "../types/types"

const logger = createLogger("useLeaderboardRefresher")

/**
 * Triggers leaderboard refresh when a game result is available.
 * Fire-and-forget; failures are logged but do not affect UI flow.
 */
export function useLeaderboardRefresher(
  gameResult: GameResult | null,
  chainId: CasinoChainId,
): void {
  useEffect(() => {
    if (!gameResult) return

    const betId = gameResult.id?.toString()
    if (!betId) return

    let cancelled = false

    const refresh = async () => {
      try {
        logger.debug("Refreshing leaderboards with bet", { betId, chainId })
        const ok = await refreshLeaderboardsWithBets([betId], chainId, LEADERBOARD_TYPE.CASINO, true)
        if (!ok && !cancelled) {
          logger.warn("refreshLeaderboardsWithBets returned false", { betId, chainId })
        }
      } catch (error) {
        if (!cancelled) {
          logger.error("Failed to refresh leaderboards", { error })
        }
      }
    }

    // Fire and forget
    refresh()

    return () => {
      cancelled = true
    }
  }, [gameResult, chainId])
}
