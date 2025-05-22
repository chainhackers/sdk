import { useState, useCallback, useMemo, useEffect } from "react"
import { Hex, zeroAddress, decodeEventLog, Abi } from "viem"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"
import { useOnchainKit } from "@coinbase/onchainkit"
import {
  GenericCasinoBetParams,
  CasinoChainId,
  getChainlinkVrfCostFunctionData,
  getPlaceBetFunctionData,
  getRollEventData,
  CoinToss,
  COINTOSS_FACE,
  CASINO_GAME_TYPE,
} from "@betswirl/sdk-core"
import { useBetResultWatcher } from "./useBetResultWatcher"
import type { GameResult, WatchTarget } from "./types"

function logDebug(context: string, message: string, data?: unknown) {
  console.log(
    `[usePlaceBet:${context}] ${message}`,
    data !== undefined ? data : "",
  )
}

interface SubmitBetResult {
  txHash: Hex
  contractAddress: Hex
  gameAbiForPlaceBet: Abi
}

export function usePlaceBet(betAmount: bigint, choice: COINTOSS_FACE) {
  const { chain } = useOnchainKit()
  const chainId = chain?.id as CasinoChainId | undefined
  const publicClient = usePublicClient({ chainId })
  const { address: connectedAddress } = useAccount()
  const { writeContractAsync, reset: resetWagmiWriteContract } =
    useWriteContract()

  const [betStatus, setBetStatus] = useState<
    "pending" | "success" | "error" | null
  >(null)
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
      logDebug("watcher", "Bet resolved: SUCCESS", {
        gameResult: watcherGameResult,
      })
    } else if (watcherStatus === "error") {
      setBetStatus("error")
      logDebug("watcher", "Bet resolved: ERROR from watcher")
    }
  }, [watcherStatus, watcherGameResult])

  const betParams = useMemo(
    () => ({
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedInput: CoinToss.encodeInput(choice),
      betAmount,
    }),
    [betAmount, choice],
  )

  const placeBet = useCallback(async () => {
    try {
      resetWagmiWriteContract()
      setGameResult(null)
      setWatchTarget(null)
      resetWatcher()

      if (
        !publicClient ||
        !chainId ||
        !connectedAddress ||
        !writeContractAsync
      ) {
        console.error(
          "Wagmi/OnchainKit clients or address are not initialized.",
        )
        setBetStatus("error")
        return
      }
      logDebug("placeBet", "Starting bet process:", {
        betParams,
        connectedAddress,
      })
      setBetStatus("pending")

      const vrfCost = await _fetchVrfCost(betParams.game, chainId, publicClient)

      const submitResult = await _submitBetTransaction(
        betParams,
        connectedAddress,
        vrfCost,
        chainId,
        writeContractAsync,
      )
      const { txHash, contractAddress, gameAbiForPlaceBet } = submitResult

      const betId = await _extractBetIdFromReceipt(
        txHash,
        contractAddress,
        gameAbiForPlaceBet,
        publicClient,
      )

      if (!betId) {
        logDebug(
          "placeBet",
          "Bet ID was not extracted. Roll event listener will not be started.",
        )
        setBetStatus("error")
        return
      }

      const { data: rollEventData } = getRollEventData(
        betParams.game,
        chainId,
        betId,
      )
      logDebug("placeBet", "Setting up Roll event listener...")
      setWatchTarget({
        betId,
        contractAddress,
        gameType: betParams.game,
        eventAbi: rollEventData.abi,
        eventName: rollEventData.eventName,
        eventArgs: rollEventData.args,
      })
    } catch (error) {
      logDebug("placeBet", "Error placing bet:", error)
      setBetStatus("error")
    }
  }, [
    betParams,
    publicClient,
    chainId,
    connectedAddress,
    writeContractAsync,
    resetWagmiWriteContract,
    resetWatcher,
  ])

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
  if (!publicClient) throw new Error("publicClient is undefined")
  logDebug("_fetchVrfCost", "Getting VRF cost...")
  const vrfCostFunctionData = getChainlinkVrfCostFunctionData(
    gameType,
    zeroAddress,
    1,
    chainId,
  )
  const vrfCost = (await publicClient.readContract({
    address: vrfCostFunctionData.data.to,
    abi: vrfCostFunctionData.data.abi,
    functionName: vrfCostFunctionData.data.functionName,
    args: vrfCostFunctionData.data.args,
  })) as bigint
  logDebug("_fetchVrfCost", "VRF cost received:", vrfCost?.toString())
  return vrfCost
}

async function _submitBetTransaction(
  betParams: GenericCasinoBetParams,
  receiver: Hex,
  vrfCost: bigint,
  chainId: CasinoChainId,
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"],
): Promise<SubmitBetResult> {
  logDebug("_submitBetTransaction", "Preparing and sending transaction...")
  const placeBetTxData = getPlaceBetFunctionData(
    { ...betParams, receiver },
    chainId,
  )
  const txHash = await writeContractAsync({
    abi: placeBetTxData.data.abi,
    address: placeBetTxData.data.to,
    functionName: placeBetTxData.data.functionName,
    args: placeBetTxData.data.args,
    value: placeBetTxData.extraData.getValue(betParams.betAmount + vrfCost),
  })
  logDebug("_submitBetTransaction", "Transaction sent, hash:", txHash)
  return {
    txHash,
    contractAddress: placeBetTxData.data.to,
    gameAbiForPlaceBet: placeBetTxData.data.abi as Abi,
  }
}

async function _extractBetIdFromReceipt(
  txHash: Hex,
  expectedContractAddress: Hex,
  placeBetAbi: Abi,
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<string | null> {
  if (!publicClient) throw new Error("publicClient is undefined")
  logDebug("_extractBetIdFromReceipt", "Waiting for receipt for", txHash)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  logDebug("_extractBetIdFromReceipt", "Receipt received.")

  const placeBetEventDefinition = placeBetAbi.find(
    (item) => item.type === "event" && item.name === "PlaceBet",
  )

  if (!placeBetEventDefinition) {
    logDebug(
      "_extractBetIdFromReceipt",
      "PlaceBet event definition not found in ABI.",
    )
    return null
  }

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== expectedContractAddress.toLowerCase())
      continue
    const decodedLog = decodeEventLog({
      abi: [placeBetEventDefinition],
      data: log.data,
      topics: log.topics,
      strict: false,
    })
    if (decodedLog.eventName !== "PlaceBet") continue
    return (decodedLog.args as { id: bigint }).id.toString()
  }
  logDebug("_extractBetIdFromReceipt", "Bet ID not found in receipt.")
  return null
}
