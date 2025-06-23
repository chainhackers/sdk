import {
  CASINO_GAME_TYPE,
  CoinToss,
  Dice,
  DiceNumber,
  Keno,
  KenoEncodedRolled,
  Roulette,
  RouletteNumber,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { AbiEvent, Log } from "viem"
import { decodeEventLog } from "viem"
import { usePublicClient, useWatchContractEvent } from "wagmi"
import { createLogger } from "../lib/logger"
import { GameResult, GameRolledResult } from "../types/types"
import type { WatchTarget } from "./types"

const logger = createLogger("useBetResultWatcher")

interface UseBetResultWatcherProps {
  watchParams: WatchTarget | null
  publicClient: ReturnType<typeof usePublicClient> | null
  enabled: boolean
}

type BetResultWatcherStatus = "idle" | "listening" | "fallback_listening" | "success" | "error"

interface BetResultWatcherOutput {
  gameResult: GameResult | null
  status: BetResultWatcherStatus
  error: Error | null
  reset: () => void
}

interface DecodedEventLog {
  eventName: string
  args: readonly unknown[]
}

const POLLING_INTERVAL = 2500
const PRIMARY_WATCHER_TIMEOUT = 30000

function _extractEventData(
  decodedRollLog: DecodedEventLog,
  gameType: CASINO_GAME_TYPE,
): {
  rolledData: boolean[] | DiceNumber | RouletteNumber | KenoEncodedRolled
  payout: bigint
  id: bigint
} {
  switch (gameType) {
    case CASINO_GAME_TYPE.DICE: {
      const diceRollArgs = decodedRollLog.args as unknown as {
        id: bigint
        payout: bigint
        rolled: DiceNumber
      }
      return {
        rolledData: diceRollArgs.rolled,
        payout: diceRollArgs.payout,
        id: diceRollArgs.id,
      }
    }
    case CASINO_GAME_TYPE.COINTOSS: {
      const coinTossRollArgs = decodedRollLog.args as unknown as {
        id: bigint
        payout: bigint
        rolled: boolean[]
      }
      return {
        rolledData: coinTossRollArgs.rolled,
        payout: coinTossRollArgs.payout,
        id: coinTossRollArgs.id,
      }
    }
    case CASINO_GAME_TYPE.ROULETTE: {
      const rouletteRollArgs = decodedRollLog.args as unknown as {
        id: bigint
        payout: bigint
        rolled: RouletteNumber
      }
      return {
        rolledData: rouletteRollArgs.rolled,
        payout: rouletteRollArgs.payout,
        id: rouletteRollArgs.id,
      }
    }
    case CASINO_GAME_TYPE.KENO: {
      const kenoRollArgs = decodedRollLog.args as unknown as {
        id: bigint
        payout: bigint
        rolled: KenoEncodedRolled
      }
      return {
        rolledData: kenoRollArgs.rolled,
        payout: kenoRollArgs.payout,
        id: kenoRollArgs.id,
      }
    }
    default:
      throw new Error(`Unsupported game type for event extraction: ${gameType}`)
  }
}

function _decodeRolled(
  rolled: boolean[] | DiceNumber | RouletteNumber | KenoEncodedRolled,
  game: CASINO_GAME_TYPE,
): GameRolledResult {
  switch (game) {
    case CASINO_GAME_TYPE.COINTOSS:
      if (!Array.isArray(rolled)) {
        throw new Error(`Invalid rolled data for COINTOSS: expected boolean array, got ${rolled}`)
      }
      return {
        game: CASINO_GAME_TYPE.COINTOSS,
        rolled: CoinToss.decodeRolled(rolled[0] as boolean),
      }
    case CASINO_GAME_TYPE.DICE:
      return {
        game: CASINO_GAME_TYPE.DICE,
        rolled: Dice.decodeRolled(rolled as DiceNumber),
      }
    case CASINO_GAME_TYPE.ROULETTE:
      return {
        game: CASINO_GAME_TYPE.ROULETTE,
        rolled: Roulette.decodeRolled(rolled as RouletteNumber),
      }
    case CASINO_GAME_TYPE.KENO:
      if (!Array.isArray(rolled)) {
        throw new Error(`Invalid rolled data for KENO: expected array, got ${rolled}`)
      }
      return {
        game: CASINO_GAME_TYPE.KENO,
        rolled: Keno.decodeRolled(rolled as KenoEncodedRolled),
      }
    default:
      logger.debug(`_decodeRolled: Unsupported game type: ${game}`)
      throw new Error(`Unsupported game type for decoding roll: ${game}`)
  }
}

/**
 * Watches for bet result events from casino contracts.
 * Uses primary event subscription with automatic fallback to polling if filters fail.
 *
 * @param watchParams - Contract address, event details, and bet ID to watch
 * @param publicClient - Viem public client for blockchain interactions
 * @param enabled - Whether the watcher should be active
 * @returns Game result data, watcher status, error state, and reset function
 *
 * @example
 * ```ts
 * const { gameResult, status } = useBetResultWatcher({
 *   watchParams: { contractAddress, betId, gameType, eventAbi, eventName },
 *   publicClient,
 *   enabled: betStatus === 'awaiting_result'
 * })
 * ```
 */
export function useBetResultWatcher({
  watchParams,
  publicClient,
  enabled,
}: UseBetResultWatcherProps): BetResultWatcherOutput {
  const [internalGameResult, setInternalGameResult] = useState<GameResult | null>(null)
  const [status, setStatus] = useState<BetResultWatcherStatus>("idle")
  const [error, setError] = useState<Error | null>(null)
  const [filterErrorOccurred, setFilterErrorOccurred] = useState<boolean>(false)

  const eventArgs = useMemo(() => {
    if (watchParams?.betId) {
      return { id: watchParams.betId }
    }
    return undefined
  }, [watchParams?.betId])

  const reset = useCallback(() => {
    logger.debug("reset: Resetting watcher state")
    setInternalGameResult(null)
    setStatus("idle")
    setError(null)
    setFilterErrorOccurred(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (status !== "idle") reset()
      return
    }

    if (watchParams && publicClient && status === "idle") {
      logger.debug("useEffect[enabled,watchParams]: Watcher enabled, starting.", {
        watchParams,
      })
      setStatus("listening")
      setError(null)
      setFilterErrorOccurred(false)
    }
  }, [enabled, watchParams, publicClient, status, reset])

  useEffect(() => {
    if (enabled && watchParams && status === "listening" && !filterErrorOccurred) {
      logger.debug(
        `useEffect[timeout]: Starting primary watcher timeout (${PRIMARY_WATCHER_TIMEOUT}ms).`,
        { betId: watchParams.betId },
      )
      const timerId = setTimeout(() => {
        logger.warn(
          `useEffect[timeout]: Primary watcher timed out for betId ${watchParams.betId}. Switching to fallback.`,
        )
        setFilterErrorOccurred(true)
        setStatus("fallback_listening")
      }, PRIMARY_WATCHER_TIMEOUT)

      return () => {
        logger.debug(
          `useEffect[timeout]: Clearing primary watcher timeout for betId ${watchParams.betId}.`,
        )
        clearTimeout(timerId)
      }
    }
  }, [enabled, watchParams, status, filterErrorOccurred])

  const processEventLogs = useCallback((logs: readonly Log[], currentWatchParams: WatchTarget) => {
    const { betId, gameType, eventAbi, eventName, betAmount } = currentWatchParams
    logger.debug(`processEventLogs: Processing ${logs.length} logs for betId ${betId}`, {
      eventName,
    })

    for (const log of logs) {
      const decodedRollLog = decodeEventLog({
        abi: eventAbi,
        data: log.data,
        topics: log.topics,
        strict: false,
      })

      if (!decodedRollLog.eventName || !decodedRollLog.args) continue
      if (decodedRollLog.eventName !== eventName) continue

      const { rolledData, payout, id } = _extractEventData(
        decodedRollLog as unknown as DecodedEventLog,
        gameType,
      )

      if (id === betId) {
        const rolledResult = _decodeRolled(rolledData, gameType)
        const result: GameResult = {
          isWin: payout > betAmount,
          payout: payout,
          currency: "ETH",
          rolled: rolledResult,
        }
        logger.debug("processEventLogs: Bet event processed:", {
          ...result,
          betId,
          txHash: log.transactionHash,
        })
        setInternalGameResult(result)
        setStatus("success")
        setError(null)
        return
      }
    }
  }, [])

  useWatchContractEvent({
    address: watchParams?.contractAddress,
    abi: watchParams?.eventAbi,
    eventName: watchParams?.eventName,
    args: eventArgs,
    enabled: enabled && !!watchParams && !filterErrorOccurred && status === "listening",
    pollingInterval: POLLING_INTERVAL,
    onLogs: (logs) => {
      if (!watchParams) return
      logger.debug(`useWatchContractEvent: Received ${logs.length} logs (primary)`)
      processEventLogs(logs, watchParams)
    },
    onError: (watchError) => {
      logger.debug("useWatchContractEvent: Error from primary watcher:", watchError)
      setFilterErrorOccurred(true)
      setStatus("fallback_listening")
    },
  })

  useEffect(() => {
    if (
      !enabled ||
      !watchParams ||
      !publicClient ||
      !filterErrorOccurred ||
      status !== "fallback_listening"
    ) {
      return
    }
    logger.debug("fallbackPoller: Starting fallback polling.", {
      betId: watchParams.betId,
    })
    let isActive = true

    const poll = async () => {
      if (!isActive || !watchParams || !publicClient) return

      const { contractAddress, eventName, eventAbi, betId } = watchParams
      const eventDefinition = eventAbi.find(
        (item): item is AbiEvent => item.type === "event" && item.name === eventName,
      )

      if (!eventDefinition) {
        logger.debug(`fallbackPoller: Critical: Event definition for ${eventName} not found.`)
        setError(new Error(`Event definition for ${eventName} not found.`))
        setStatus("error")
        return
      }

      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock > 100n ? currentBlock - 100n : 0n
      logger.debug(`fallbackPoller: Querying logs from ${fromBlock} to ${currentBlock}`)
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: eventDefinition,
        args: { id: betId },
        fromBlock,
        toBlock: currentBlock,
      })
      logger.debug(`fallbackPoller: Fetched ${logs.length} logs (fallback) for betId ${betId}`)
      if (logs.length > 0) {
        processEventLogs(logs, watchParams)
      }
    }

    poll()
    const intervalId = setInterval(poll, POLLING_INTERVAL)

    return () => {
      logger.debug("fallbackPoller: Stopping fallback polling.")
      isActive = false
      clearInterval(intervalId)
    }
  }, [enabled, watchParams, publicClient, filterErrorOccurred, status, processEventLogs])

  useEffect(() => {
    if (status === "success" || status === "error") {
      logger.debug(`useEffect[status]: Final status reached: ${status}. Watcher inactive.`)
    }
  }, [status])

  return { gameResult: internalGameResult, status, error, reset }
}
