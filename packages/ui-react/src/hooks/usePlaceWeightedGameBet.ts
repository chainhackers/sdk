import {
  BetSwirlWallet,
  CASINO_GAME_TYPE,
  CasinoChainId,
  casinoChainById,
  GenericCasinoBetParams,
  getPlaceBetEventData,
  getPlaceBetFunctionData,
  getPlacedBetFromReceipt,
  getRollEventData,
  WeightedGame,
  type WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { decodeEventLog, Hex } from "viem"
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { createLogger } from "../lib/logger"
import { BetStatus, GameResult, TokenWithImage } from "../types/types"
import type { WatchTarget } from "./types"
import { useBetResultWatcher } from "./useBetResultWatcher"
import { useEstimateVRFFees } from "./useEstimateVRFFees"

const logger = createLogger("usePlaceWeightedGameBet")

export interface IUsePlaceWeightedGameBetReturn {
  placeBet: (betAmount: bigint, config: WeightedGameConfiguration) => Promise<void>
  betStatus: BetStatus
  isWaiting: boolean
  isError: unknown
  gameResult: GameResult | null
  resetBetState: () => void
  vrfFees: bigint
  gasPrice: bigint
  formattedVrfFees: number
  wagerWriteHook: ReturnType<typeof useWriteContract>
  wagerWaitingHook: ReturnType<typeof useWaitForTransactionReceipt>
}

export function usePlaceWeightedGameBet(
  game: CASINO_GAME_TYPE,
  token: TokenWithImage,
  refetchBalance: () => void,
): IUsePlaceWeightedGameBetReturn {
  const { appChainId } = useChain()
  const { affiliate } = useBettingConfig()
  const publicClient = usePublicClient({ chainId: appChainId })
  const { address: connectedAddress } = useAccount()
  const wagerWriteHook = useWriteContract()

  const wagerWaitingHook = useWaitForTransactionReceipt({
    hash: wagerWriteHook.data,
    chainId: appChainId,
  })
  const {
    vrfFees,
    wagmiHook: estimateVrfFeesWagmiHook,
    formattedVrfFees,
    gasPrice,
  } = useEstimateVRFFees({
    game,
    token,
    betCount: 1,
  })

  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [watchTarget, setWatchTarget] = useState<WatchTarget | null>(null)
  const [currentBetAmount, setCurrentBetAmount] = useState<bigint | null>(null)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  const betStatus: BetStatus = useMemo(() => {
    if (internalError) return "internal-error"
    if (wagerWriteHook.isPending) return "pending"
    if (wagerWaitingHook.isLoading) return "loading"
    if (isRolling) return "rolling"
    if (gameResult) return "success"
    if (wagerWriteHook.error || wagerWaitingHook.error) return "error"
    return null
  }, [
    internalError,
    wagerWriteHook.isPending,
    wagerWaitingHook.isLoading,
    isRolling,
    gameResult,
    wagerWriteHook.error,
    wagerWaitingHook.error,
  ])

  const isWaiting = useMemo(() => {
    return wagerWriteHook.isPending || wagerWaitingHook.isLoading || isRolling
  }, [wagerWriteHook.isPending, wagerWaitingHook.isLoading, isRolling])

  const isError = useMemo(() => {
    return wagerWriteHook.error || wagerWaitingHook.error || internalError
  }, [wagerWriteHook.error, wagerWaitingHook.error, internalError])

  const {
    gameResult: watcherGameResult,
    status: watcherStatus,
    reset: resetWatcher,
  } = useBetResultWatcher({
    watchParams: watchTarget,
    publicClient,
    enabled: !!watchTarget,
  })

  useEffect(() => {
    if (watcherStatus === "success" && watcherGameResult) {
      setGameResult(watcherGameResult)
      setIsRolling(false)
      logger.debug("watcher: Bet resolved: SUCCESS", {
        gameResult: watcherGameResult,
      })

      refetchBalance()
    } else if (watcherStatus === "error") {
      setInternalError("watcher error")
      logger.debug("watcher: Bet resolved: ERROR from watcher")
    }
  }, [watcherStatus, watcherGameResult, refetchBalance])

  const resetBetState = useCallback(() => {
    wagerWriteHook.reset()
    setGameResult(null)
    setWatchTarget(null)
    setCurrentBetAmount(null)
    setInternalError(null)
    setIsRolling(false)
    resetWatcher()
  }, [resetWatcher, wagerWriteHook.reset])

  const placeBet = useCallback(
    async (betAmount: bigint, config: WeightedGameConfiguration) => {
      resetBetState()
      setCurrentBetAmount(betAmount)

      const encodedInput = WeightedGame.encodeInput(config.configId)

      const betParams = {
        game,
        gameEncodedInput: encodedInput,
        betAmount,
        tokenAddress: token.address,
      }

      if (!publicClient || !appChainId || !connectedAddress || !wagerWriteHook.writeContract) {
        logger.error("placeBet: Wagmi/OnchainKit clients or address are not initialized.")
        setInternalError("clients or address are not initialized")
        return
      }
      logger.debug("placeBet: Starting weighted game bet process:", {
        betParams,
        connectedAddress,
        configId: config.configId,
      })

      await estimateVrfFeesWagmiHook.refetch()

      logger.debug("placeBet: VRF cost refetched:", formattedVrfFees)

      _submitBetTransaction(
        betParams,
        connectedAddress,
        vrfFees,
        gasPrice,
        appChainId,
        affiliate,
        wagerWriteHook.writeContract,
      )
    },
    [
      game,
      resetBetState,
      publicClient,
      appChainId,
      connectedAddress,
      wagerWriteHook.writeContract,
      estimateVrfFeesWagmiHook.refetch,
      formattedVrfFees,
      vrfFees,
      gasPrice,
      token,
      affiliate,
    ],
  )

  useEffect(() => {
    if (wagerWriteHook.error) {
      logger.debug(
        "_usePlaceWeightedGameBet: An error occurred in wager write:",
        wagerWriteHook.error,
      )
    }
  }, [wagerWriteHook.error])

  useEffect(() => {
    if (wagerWaitingHook.error) {
      logger.debug(
        "_usePlaceWeightedGameBet: An error occurred in wager waiting:",
        wagerWaitingHook.error,
      )
    }
  }, [wagerWaitingHook.error])

  useEffect(() => {
    if (wagerWaitingHook.isSuccess) {
      setIsRolling(true)
      const handleBetResult = async () => {
        const betId = await _extractBetIdFromReceipt(
          wagerWriteHook.data!,
          game,
          appChainId,
          connectedAddress!,
          publicClient,
        )

        if (!betId) {
          logger.error(
            "placeBet: Bet ID was not extracted. Roll event listener will not be started.",
          )
          setInternalError("bet id not found")
          return
        }

        const placedBet = await getPlacedBetFromReceipt(
          { publicClient } as unknown as BetSwirlWallet,
          wagerWaitingHook.data!,
          game,
          appChainId,
          token,
        )

        if (!placedBet) {
          logger.error("placeBet: PlacedBet could not be extracted from receipt.")
          setInternalError("placed bet not found")
          return
        }

        const { data: rollEventData } = getRollEventData(game, appChainId, betId)
        logger.debug("placeBet: Setting up Roll event listener...")
        setWatchTarget({
          betId,
          contractAddress: casinoChainById[appChainId].contracts.games[game]!.address,
          gameType: game,
          eventAbi: rollEventData.abi,
          eventName: rollEventData.eventName,
          eventArgs: rollEventData.args,
          betAmount: currentBetAmount!,
          placedBet,
        })

        refetchBalance()
      }
      handleBetResult()
    }
  }, [
    wagerWaitingHook.isSuccess,
    wagerWaitingHook.data,
    wagerWriteHook.data,
    game,
    appChainId,
    connectedAddress,
    publicClient,
    refetchBalance,
    currentBetAmount,
    token,
  ])

  return {
    placeBet,
    betStatus,
    isWaiting,
    isError,
    gameResult,
    resetBetState,
    vrfFees,
    gasPrice,
    formattedVrfFees,
    wagerWriteHook,
    wagerWaitingHook,
  }
}

async function _submitBetTransaction(
  betParams: GenericCasinoBetParams,
  receiver: Hex,
  vrfCost: bigint,
  gasPrice: bigint,
  chainId: CasinoChainId,
  affiliate: Hex,
  wagerWriteHook: ReturnType<typeof useWriteContract>["writeContract"],
) {
  logger.debug("_submitBetTransaction: Preparing and sending weighted game transaction...")
  const placeBetTxData = getPlaceBetFunctionData({ ...betParams, receiver, affiliate }, chainId)
  wagerWriteHook({
    abi: placeBetTxData.data.abi,
    address: placeBetTxData.data.to,
    functionName: placeBetTxData.data.functionName,
    args: placeBetTxData.data.args,
    value: placeBetTxData.extraData.getValue(vrfCost),
    gasPrice,
    chainId,
  })
}

async function _extractBetIdFromReceipt(
  txHash: Hex,
  game: CASINO_GAME_TYPE,
  chainId: CasinoChainId,
  connectedAddress: Hex,
  publicClient: any,
): Promise<bigint | null> {
  try {
    const { data: placeBetEventData } = getPlaceBetEventData(game, chainId, connectedAddress)
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

    for (const log of receipt.logs) {
      try {
        const decodedLog = decodeEventLog({
          abi: placeBetEventData.abi,
          data: log.data,
          topics: log.topics,
        })

        if (decodedLog.eventName === placeBetEventData.eventName && decodedLog.args) {
          return (decodedLog.args as any).id as bigint
        }
      } catch {}
    }

    return null
  } catch (error) {
    logger.error("_extractBetIdFromReceipt: Error extracting bet ID:", error)
    return null
  }
}
