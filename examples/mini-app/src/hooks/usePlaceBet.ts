import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  CasinoChainId,
  CoinToss,
  GenericCasinoBetParams,
  getChainlinkVrfCostFunctionData,
  getPlaceBetEventData,
  getPlaceBetFunctionData,
  getRollEventData,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useState } from "react"
import { Hex, decodeEventLog, zeroAddress } from "viem"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"
import { createLogger } from "../lib/logger"
import type { GameResult, WatchTarget } from "./types"
import { useBetResultWatcher } from "./useBetResultWatcher"
import { useChain } from "../context/chainContext"

const logger = createLogger("usePlaceBet")

interface SubmitBetResult {
  txHash: Hex
  contractAddress: Hex
}

export function usePlaceBet() {
  const { appChainId } = useChain()
  const publicClient = usePublicClient({ chainId: appChainId })
  const { address: connectedAddress } = useAccount()
  const { writeContractAsync, reset: resetWagmiWriteContract } = useWriteContract()

  const [betStatus, setBetStatus] = useState<"pending" | "success" | "error" | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [watchTarget, setWatchTarget] = useState<WatchTarget | null>(null)

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
      setBetStatus("success")
      logger.debug("watcher: Bet resolved: SUCCESS", {
        gameResult: watcherGameResult,
      })
    } else if (watcherStatus === "error") {
      setBetStatus("error")
      logger.debug("watcher: Bet resolved: ERROR from watcher")
    }
  }, [watcherStatus, watcherGameResult])

  const placeBet = useCallback(
    async (betAmount: bigint, choice: COINTOSS_FACE) => {
      try {
        resetWagmiWriteContract()
        setGameResult(null)
        setWatchTarget(null)
        resetWatcher()

        const betParams = {
          game: CASINO_GAME_TYPE.COINTOSS,
          gameEncodedInput: CoinToss.encodeInput(choice),
          betAmount,
        }

        if (!publicClient || !appChainId || !connectedAddress || !writeContractAsync) {
          logger.error("placeBet: Wagmi/OnchainKit clients or address are not initialized.")
          setBetStatus("error")
          return
        }
        logger.debug("placeBet: Starting bet process:", {
          betParams,
          connectedAddress,
        })
        setBetStatus("pending")

        const vrfCost = await _fetchVrfCost(betParams.game, appChainId, publicClient)

        const submitResult = await _submitBetTransaction(
          betParams,
          connectedAddress,
          vrfCost,
          appChainId,
          writeContractAsync,
        )
        const { txHash, contractAddress } = submitResult

        const betId = await _extractBetIdFromReceipt(
          txHash,
          contractAddress,
          betParams.game,
          appChainId,
          connectedAddress,
          publicClient,
        )

        if (!betId) {
          logger.error(
            "placeBet: Bet ID was not extracted. Roll event listener will not be started.",
          )
          setBetStatus("error")
          return
        }

        const { data: rollEventData } = getRollEventData(betParams.game, appChainId, betId)
        logger.debug("placeBet: Setting up Roll event listener...")
        setWatchTarget({
          betId,
          contractAddress,
          gameType: betParams.game,
          eventAbi: rollEventData.abi,
          eventName: rollEventData.eventName,
          eventArgs: rollEventData.args,
        })
      } catch (error) {
        logger.error("placeBet: Error placing bet:", error)
        setBetStatus("error")
      }
    },
    [
      publicClient,
      appChainId,
      connectedAddress,
      writeContractAsync,
      resetWagmiWriteContract,
      resetWatcher,
    ],
  )

  const resetBetState = useCallback(() => {
    setBetStatus(null)
    setGameResult(null)
    setWatchTarget(null)
    resetWatcher()
  }, [resetWatcher])

  return { placeBet, betStatus, gameResult, resetBetState }
}

async function _fetchVrfCost(
  gameType: CASINO_GAME_TYPE,
  chainId: CasinoChainId,
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<bigint> {
  if (!publicClient) {
    logger.error("_fetchVrfCost: publicClient is undefined")
    throw new Error("publicClient is undefined")
  }
  logger.debug("_fetchVrfCost: Getting VRF cost...")
  const vrfCostFunctionData = getChainlinkVrfCostFunctionData(gameType, zeroAddress, 1, chainId)
  const vrfCost = (await publicClient.readContract({
    address: vrfCostFunctionData.data.to,
    abi: vrfCostFunctionData.data.abi,
    functionName: vrfCostFunctionData.data.functionName,
    args: vrfCostFunctionData.data.args,
  })) as bigint
  logger.debug("_fetchVrfCost: VRF cost received:", vrfCost?.toString())
  return vrfCost
}

async function _submitBetTransaction(
  betParams: GenericCasinoBetParams,
  receiver: Hex,
  vrfCost: bigint,
  chainId: CasinoChainId,
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"],
): Promise<SubmitBetResult> {
  logger.debug("_submitBetTransaction: Preparing and sending transaction...")
  const placeBetTxData = getPlaceBetFunctionData({ ...betParams, receiver }, chainId)
  const txHash = await writeContractAsync({
    abi: placeBetTxData.data.abi,
    address: placeBetTxData.data.to,
    functionName: placeBetTxData.data.functionName,
    args: placeBetTxData.data.args,
    value: placeBetTxData.extraData.getValue(betParams.betAmount + vrfCost),
  })
  logger.debug("_submitBetTransaction: Transaction sent, hash:", txHash)
  return {
    txHash,
    contractAddress: placeBetTxData.data.to,
  }
}

async function _extractBetIdFromReceipt(
  txHash: Hex,
  expectedContractAddress: Hex,
  gameType: CASINO_GAME_TYPE,
  chainId: CasinoChainId,
  receiver: Hex,
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<bigint | null> {
  if (!publicClient) {
    logger.error("_extractBetIdFromReceipt: publicClient is undefined")
    throw new Error("publicClient is undefined")
  }
  logger.debug("_extractBetIdFromReceipt: Waiting for receipt for", txHash)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  logger.debug("_extractBetIdFromReceipt: Receipt received.")

  const { data: placeBetEventData } = getPlaceBetEventData(gameType, chainId, receiver)

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== expectedContractAddress.toLowerCase()) continue
    const decodedLog = decodeEventLog({
      abi: placeBetEventData.abi,
      data: log.data,
      topics: log.topics,
      strict: false,
    })
    if (decodedLog.eventName === placeBetEventData.eventName) {
      return (decodedLog.args as unknown as { id: bigint }).id
    }
  }
  logger.error("_extractBetIdFromReceipt: Bet ID not found in receipt.")
  return null
}
