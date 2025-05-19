import { useState, useEffect, useCallback } from "react"
import { zeroAddress } from "viem"
import { useAccount, useWriteContract } from "wagmi"
// import { Hex, zeroAddress, decodeEventLog } from "viem"
// import { useAccount, useWriteContract, usePublicClient } from "wagmi"

import {
  CasinoChainId,
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  // CoinToss,
} from "@betswirl/sdk-core"
import { useVrfCost } from "./useVrfCost"
import { useOnchainKit } from "@coinbase/onchainkit"
import { usePlaceBetTxData } from "./usePlaceBetTxData.ts"

interface BetRequest {
  betAmount: bigint
  coinFace: COINTOSS_FACE
}

export function usePlaceBet(betAmount: bigint, coinFace: COINTOSS_FACE) {
  const { chain } = useOnchainKit()
  const chainId = chain.id as CasinoChainId
  const { chainId: currentConnectedChainId } = useAccount()
  const { getPlaceBetTxData } = usePlaceBetTxData(betAmount, coinFace)
  const {
    data: transactionHash,
    isPending: isTransactionPending,
    error: transactionError,
    writeContract,
    reset: resetWriteContract,
  } = useWriteContract()

  const {
    isLoadingVrfCost,
    vrfCostError,
    fetchVrfCost,
    resetVrfCostState,
    vrfCost,
  } = useVrfCost()

  // const publicClient = usePublicClient({ chainId })

  const [currentBetRequest, setCurrentBetRequest] = useState<BetRequest | null>(
    null,
  )

  const [isWaitingForRollEvent, setIsWaitingForRollEvent] =
    useState<boolean>(false)

  // const [activeBetDetailsForRoll, setActiveBetDetailsForRoll] = useState<{
  //   betId: string
  //   betAmount: bigint
  //   gameType: CASINO_GAME_TYPE
  // } | null>(null)
  // const [rollEventError, setRollEventError] = useState<Error | null>(null)

  // usePlaceBetTxData(betAmount, face)

  const placeBet = () => {
    if (currentConnectedChainId !== chainId) {
      const errMsg = `Wrong network. Expected: ${chainId}, connected: ${currentConnectedChainId}`
      console.error(errMsg)
      throw new Error(errMsg)
    }

    setIsWaitingForRollEvent(false)
    resetWriteContract()
    resetVrfCostState()

    fetchVrfCost(CASINO_GAME_TYPE.COINTOSS, 1, zeroAddress)
    setCurrentBetRequest({ betAmount, coinFace })
    // console.log(`Betting ${betAmount} on ${face}`)
  }

  useEffect(() => {
    if (!currentBetRequest || isLoadingVrfCost) {
      return
    }

    if (vrfCostError) {
      setCurrentBetRequest(null)
      return
    }

    if (vrfCost === undefined) {
      setCurrentBetRequest(null)
      throw new Error("Failed to determine VRF cost. Bet cannot be placed.")
    }

    const {data, extraData} = getPlaceBetTxData()

      writeContract({
        ...data,
        address: data.to,
        chainId: chainId,
        value: extraData.getValue(betAmount + vrfCost),
      })
  }, [
    currentBetRequest,
    vrfCost,
    isLoadingVrfCost,
    vrfCostError,
    chainId,
    writeContract,
  ])

  useEffect(() => {
    if (
      !transactionHash ||
      transactionError
   ) {
      return
    }
      console.log(
        `[usePlaceBet] Bet transaction sent: ${transactionHash}. Waiting for receipt to get betId...`,
      )
  //
  //     const placeBetTxData = usePlaceBetTxData(
  //       betAmount, face
  //     )
  //
  //     const processReceiptForBetDetails = async () => {
  //       // const receipt = await publicClient.waitForTransactionReceipt({
  //       //   hash: transactionHash,
  //       // })
  //       // console.log("[usePlaceBet] Transaction receipt for PlaceBet:", receipt)
  //
  //
  //       const placeBetEventDefinition = placeBetTxData.data.abi.find(
  //         (item) => item.type === "event" && item.name === "PlaceBet",
  //       )
  //       if (!placeBetEventDefinition) {
  //         throw new Error(
  //           `PlaceBet event definition not found in ABI for game ${CASINO_GAME_TYPE.COINTOSS}.`,
  //         )
  //       }
  //
  //       // let foundBetId: string | null = null
  //       // let foundBetAmount: bigint | null = null
  //
  //       // for (const log of receipt.logs) {
  //       //   if (
  //       //     log.address.toLowerCase() !== placeBetTxData.data.to.toLowerCase()
  //       //   ) {
  //       //     continue
  //       //   }
  //       //   const decodedLog = decodeEventLog({
  //       //     abi: [placeBetEventDefinition],
  //       //     data: log.data,
  //       //     topics: log.topics,
  //       //     strict: false,
  //       //   })
  //       //
  //       //   if (decodedLog.eventName === "PlaceBet") {
  //       //     const args = decodedLog.args as {
  //       //       id: bigint
  //       //       amount: bigint
  //       //     }
  //       //     foundBetId = args.id.toString()
  //       //     foundBetAmount = args.amount
  //       //     console.log(
  //       //       `[usePlaceBet] PlaceBet event decoded. Bet ID: ${foundBetId}, Amount: ${foundBetAmount}`,
  //       //     )
  //       //     break
  //       //   }
  //       // }
  //
  //     //   if (foundBetId && foundBetAmount !== null) {
  //     //     setActiveBetDetailsForRoll({
  //     //       betId: foundBetId,
  //     //       betAmount: foundBetAmount,
  //     //       gameType: gameType,
  //     //     })
  //     //     setIsWaitingForRollEvent(true)
  //     //     setRollEventError(null)
  //     //   } else {
  //     //     console.error(
  //     //       "[usePlaceBet] PlaceBet event not found in transaction receipt.",
  //     //     )
  //     //     setRollEventError(new Error("PlaceBet event not found in receipt."))
  //     //   }
  //     }
  //
  //     processReceiptForBetDetails()
  //   } else if (transactionError && currentBetRequest) {
  //     setCurrentBetRequest(null)
  //   }
  }, [
    transactionHash,
    transactionError,
    currentBetRequest,
    chainId,
  ])

  // useEffect(() => {
  //   // if (!activeBetDetailsForRoll || !publicClient || !currentBetRequest) {
  //   if (!activeBetDetailsForRoll || !currentBetRequest) {
  //     return
  //   }
  //
  //   // const { betId, gameType, betAmount } = activeBetDetailsForRoll
  //   const { betId, gameType } = activeBetDetailsForRoll
  //   const { betAmount, face } = currentBetRequest
  //   const placeBetTxData = usePlaceBetTxData(
  //     betAmount, face
  //   )
  //   const rollEventDefinition = placeBetTxData.data.abi.find(
  //     (item) => item.type === "event" && item.name === "Roll",
  //   )
  //   console.log({ rollEventDefinition })
  //   if (!rollEventDefinition) {
  //     const errorMsg = `[usePlaceBet] Roll event definition not found in ABI for game ${gameType}`
  //     console.error(errorMsg)
  //     setRollEventError(new Error(errorMsg))
  //     setIsWaitingForRollEvent(false)
  //     setActiveBetDetailsForRoll(null)
  //     return
  //   }
  //
  //   console.log(
  //     `[usePlaceBet] Starting to listen for Roll event for Bet ID: ${betId} on contract ${placeBetTxData.data.to}`,
  //   )
  //   //
  //   // const unwatch = publicClient.watchContractEvent({
  //   //   address: placeBetTxData.data.to,
  //   //   abi: [rollEventDefinition],
  //   //   eventName: "Roll",
  //   //   args: { id: BigInt(betId) as any },
  //   //   pollingInterval: 1000,
  //   //   onLogs: (logs) => {
  //   //     logs.forEach((log: any) => {
  //   //       const decodedRollLog = decodeEventLog({
  //   //         abi: [rollEventDefinition],
  //   //         data: log.data,
  //   //         topics: log.topics,
  //   //         strict: false,
  //   //       })
  //   //       const rollArgs = decodedRollLog.args as {
  //   //         id: bigint
  //   //         payout: bigint
  //   //         rolled: boolean[]
  //   //       }
  //   //
  //   //       if (rollArgs.id.toString() === betId) {
  //   //         console.log("===== [usePlaceBet] GAME RESULT (Roll event) =====")
  //   //         console.log("Bet ID:", betId)
  //   //         console.log("Rolled (raw from event):", rollArgs.rolled)
  //   //
  //   //         let decodedRolledValueStr =
  //   //           "N/A (logic for this game type not implemented in usePlaceBet log)"
  //   //         if (
  //   //           gameType === CASINO_GAME_TYPE.COINTOSS &&
  //   //           rollArgs.rolled &&
  //   //           rollArgs.rolled.length > 0
  //   //         ) {
  //   //           const decodedRolled = CoinToss.decodeRolled(rollArgs.rolled[0])
  //   //           decodedRolledValueStr = decodedRolled.toString()
  //   //           console.log(
  //   //             "Rolled (decoded for CoinToss):",
  //   //             decodedRolledValueStr,
  //   //           )
  //   //         }
  //   //
  //   //         console.log("Payout:", rollArgs.payout.toString())
  //   //         console.log("Original Bet Amount:", betAmount.toString())
  //   //         const isWin = rollArgs.payout > 0n
  //   //         console.log("Is Win:", isWin)
  //   //         console.log("Roll Transaction Hash:", log.transactionHash)
  //   //         console.log("================================================")
  //   //
  //   //         setIsWaitingForRollEvent(false)
  //   //         setActiveBetDetailsForRoll(null)
  //   //         unwatch()
  //   //       }
  //   //     })
  //   //   },
  //   //   onError: (error) => {
  //   //     console.error("[usePlaceBet] Error watching Roll event:", error)
  //   //     setRollEventError(error)
  //   //     setIsWaitingForRollEvent(false)
  //   //     setActiveBetDetailsForRoll(null)
  //   //   },
  //   // })
  //
  //   return () => {
  //     console.log(
  //       `[usePlaceBet] Stopped listening for Roll event for Bet ID: ${betId}`,
  //     )
  //     // unwatch()
  //   }
  // }, [activeBetDetailsForRoll, chainId, currentBetRequest])

  const combinedError = vrfCostError || transactionError

  return {
    placeBet,
    isPlacingBet: isLoadingVrfCost || isTransactionPending,
    isWaitingForResult: isWaitingForRollEvent,
    betError: combinedError,
    transactionHash,
  }
}
