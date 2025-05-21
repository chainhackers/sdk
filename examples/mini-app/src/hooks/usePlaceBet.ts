import { useState, useCallback, useMemo } from "react"
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
      console.log("Starting bet process:", { betParams, connectedAddress })
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
        console.warn(
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
      console.log("Setting up Roll event listener...")
      setWatchTarget({
        betId,
        contractAddress,
        gameType: betParams.game,
        eventAbi: rollEventData.abi,
        eventName: rollEventData.eventName,
        eventArgs: rollEventData.args,
      })
    } catch (error) {
      console.error("Error placing bet:", error)
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

  useWatchContractEvent({
    address: watchTarget?.contractAddress,
    abi: watchTarget?.eventAbi,
    eventName: watchTarget?.eventName,
    args: watchTarget ? { id: BigInt(watchTarget.betId) } : undefined,
    enabled: !!watchTarget,
    pollingInterval: POLLING_INTERVAL,
    onLogs: (logs) => {
      if (!watchTarget) return

      const { betId } = watchTarget

      logs.forEach((log) => {
        const decodedRollLog = decodeEventLog({
          abi: watchTarget.eventAbi,
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
          const rolled = _decodeRolled(rollArgs.rolled, betParams.game)
          console.log({
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
          setBetStatus("success")
        }
      })
    },
    onError: (errorWatch) => {
      console.error(" Error listening to Roll event:", errorWatch)
      setWatchTarget(null)
      setBetStatus("error")
    },
  })

  const resetBetState = useCallback(() => {
    setBetStatus(null)
    setGameResult(null)
  }, [])

  return { placeBet, betStatus, gameResult, resetBetState }
}

async function _fetchVrfCost(
  gameType: CASINO_GAME_TYPE,
  chainId: CasinoChainId,
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<bigint> {
  if (!publicClient) throw new Error("publicClient is undefined")
  console.log("Getting VRF cost...")
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
  console.log("VRF cost received:", vrfCost?.toString())
  return vrfCost
}

async function _submitBetTransaction(
  betParams: GenericCasinoBetParams,
  receiver: Hex,
  vrfCost: bigint,
  chainId: CasinoChainId,
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"],
): Promise<SubmitBetResult> {
  console.log("Preparing and sending transaction...")
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
  console.log("Transaction sent, hash:", txHash)
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
  console.log("Waiting for receipt for", txHash)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  console.log("Receipt received.")

  const placeBetEventDefinition = placeBetAbi.find(
    (item) => item.type === "event" && item.name === "PlaceBet",
  )

  if (!placeBetEventDefinition) {
    console.warn("PlaceBet event definition not found in ABI.")
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
  console.warn("Bet ID not found in receipt.")
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
