import { useState, useCallback, useMemo, useEffect } from "react"
import { Hex, zeroAddress, decodeEventLog, Abi } from "viem"
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi"
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

function logDebug(context: string, message: string, data?: any) {
  console.log(`[usePlaceBet:${context}] ${message}`, data !== undefined ? data : '');
}

interface WatchTarget {
  betId: string
  contractAddress: Hex
  gameType: CASINO_GAME_TYPE
  eventAbi: Abi
  eventName: string
  eventArgs: { id: bigint }
}

interface SubmitBetResult {
  txHash: Hex
  contractAddress: Hex
  gameAbiForPlaceBet: Abi
}

interface GameResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: COINTOSS_FACE
}

const POLLING_INTERVAL = 2500

export function usePlaceBet(betAmount: bigint, choice: COINTOSS_FACE) {
  const { chain } = useOnchainKit()
  const chainId = chain?.id as CasinoChainId | undefined
  const publicClient = usePublicClient({ chainId })
  const { address: connectedAddress } = useAccount()
  const { writeContractAsync, reset: resetWagmiWriteContract } =
    useWriteContract()

  const [watchTarget, setWatchTarget] = useState<WatchTarget | null>(null)
  const [betStatus, setBetStatus] = useState<
    "pending" | "success" | "error" | null
  >(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [filterError, setFilterError] = useState<boolean>(false)

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
      setWatchTarget(null)
      resetWagmiWriteContract()
      setGameResult(null)
      setFilterError(false)

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
      logDebug("placeBet", "Starting bet process:", { betParams, connectedAddress })
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
        logDebug("placeBet", "Bet ID was not extracted. Roll event listener will not be started.")
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
  ])

  // Primary event watcher using useWatchContractEvent
  useWatchContractEvent({
    address: watchTarget?.contractAddress,
    abi: watchTarget?.eventAbi,
    eventName: watchTarget?.eventName,
    args: watchTarget ? { id: BigInt(watchTarget.betId) } : undefined,
    enabled: !!watchTarget && !filterError,
    pollingInterval: POLLING_INTERVAL,
    onLogs: (logs) => {
      logDebug("useWatchContractEvent", "Received logs:", { count: logs.length })
      if (!watchTarget) return

      _processEventLogs(logs, watchTarget)
    },
    onError: (errorWatch) => {
      logDebug("useWatchContractEvent", "Error listening to Roll event:", errorWatch)
      // Mark that we had a filter error so we can use the fallback
      setFilterError(true)
    },
  })

  // Fallback for when filter-based watching fails - manually poll for logs
  useEffect(() => {
    if (!watchTarget || !filterError || !publicClient) return

    logDebug("fallbackPoller", "Starting fallback polling for events")
    
    let isActive = true
    const intervalId = setInterval(async () => {
      if (!isActive || !watchTarget) return
      
      try {
        // Fetch logs directly instead of using filters
        const fromBlock = await publicClient.getBlockNumber() - 10n // Last 10 blocks
        const logs = await publicClient.getLogs({
          address: watchTarget.contractAddress,
          event: {
            type: 'event',
            name: watchTarget.eventName,
            inputs: watchTarget.eventAbi.find(item => 
              item.type === 'event' && item.name === watchTarget.eventName
            )?.inputs || [],
          },
          args: {
            id: BigInt(watchTarget.betId)
          },
          fromBlock,
        })
        
        logDebug("fallbackPoller", `Fetched ${logs.length} logs directly`)
        
        if (logs.length > 0) {
          _processEventLogs(logs, watchTarget)
        }
      } catch (error) {
        logDebug("fallbackPoller", "Error in fallback log polling:", error)
      }
    }, POLLING_INTERVAL)

    return () => {
      isActive = false
      clearInterval(intervalId)
    }
  }, [watchTarget, filterError, publicClient])

  // Function to process event logs - extract to avoid duplication
  const _processEventLogs = useCallback((logs: any[], target: WatchTarget) => {
    const { betId } = target

    logs.forEach((log) => {
      try {
        const decodedRollLog = decodeEventLog({
          abi: target.eventAbi,
          data: log.data,
          topics: log.topics,
          strict: false,
        })

        const rollArgs = decodedRollLog.args as unknown as {
          id: bigint
          payout: bigint
          rolled: boolean[]
        }

        if (rollArgs.id.toString() === betId) {
          const rolled = _decodeRolled(rollArgs.rolled, target.gameType)
          logDebug("processLogs", "Bet rolled:", {
            betId,
            payout: rollArgs.payout.toString(),
            isWin: rollArgs.payout > 0n,
            rollTransactionHash: log.transactionHash,
            rolled,
          })
          
          setGameResult({
            isWin: rollArgs.payout > 0n,
            payout: rollArgs.payout,
            currency: "ETH",
            rolled,
          })
          setWatchTarget(null)
          setFilterError(false)
          setBetStatus("success")
        }
      } catch (decodeError) {
        logDebug("processLogs", "Error decoding log:", decodeError)
      }
    })
  }, [])

  const resetBetState = useCallback(() => {
    setBetStatus(null)
    setGameResult(null)
    setFilterError(false)
  }, [])

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
    logDebug("_extractBetIdFromReceipt", "PlaceBet event definition not found in ABI.")
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

function _decodeRolled(
  rolled: boolean[],
  game: CASINO_GAME_TYPE,
): COINTOSS_FACE {
  switch (game) {
    case CASINO_GAME_TYPE.COINTOSS:
      return CoinToss.decodeRolled(rolled[0])
    default:
      throw new Error(`Unsupported game type: ${game}`)
  }
}
