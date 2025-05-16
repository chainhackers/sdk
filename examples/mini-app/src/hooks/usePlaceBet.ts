import { useState, useEffect, useCallback } from "react"
import { Hex, zeroAddress } from "viem"
import { useAccount, useWriteContract } from "wagmi"

import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
} from "@betswirl/sdk-core"
import { useVrfCost } from "./useVrfCost"
import { CHAIN } from "../providers.tsx"

interface UsePlaceBetProps {
  chainId?: CasinoChainId
}

interface BetRequest {
  params: GenericCasinoBetParams
  receiver: Hex
}

export function usePlaceBet({ chainId = CHAIN.id }: UsePlaceBetProps = {}) {
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
  } = useVrfCost({ chainId })

  const { chainId: currentChainId } = useAccount()

  const [currentBetRequest, setCurrentBetRequest] = useState<BetRequest | null>(
    null,
  )
  const [prepareBetError, setPrepareBetError] = useState<Error | null>(null)

  const placeBet = useCallback(
    (betParams: GenericCasinoBetParams, receiver: Hex) => {
      if (currentChainId !== chainId) {
        console.error(
          `Wrong network. Expected: ${chainId}, connected: ${currentChainId}`,
        )
        return
      }
      resetWriteContract()
      resetVrfCostState()
      setPrepareBetError(null)
      setCurrentBetRequest({ params: betParams, receiver })
      fetchVrfCost(betParams.game, 1, zeroAddress)
    },
    [
      resetWriteContract,
      resetVrfCostState,
      fetchVrfCost,
      chainId,
      currentChainId,
    ],
  )

  useEffect(() => {
    if (!currentBetRequest || isLoadingVrfCost) {
      return
    }

    if (vrfCostError) {
      setCurrentBetRequest(null)
      return
    }

    if (vrfCost === undefined) {
      setPrepareBetError(
        new Error("Failed to determine VRF cost. Bet cannot be placed."),
      )
      setCurrentBetRequest(null)
      return
    }

    const { params, receiver } = currentBetRequest

    const placeBetTxData = getPlaceBetFunctionData(
      {
        ...params,
        tokenAddress: zeroAddress,
        receiver,
      },
      chainId,
    )

    writeContract({
      abi: placeBetTxData.data.abi,
      address: placeBetTxData.data.to,
      functionName: placeBetTxData.data.functionName,
      args: placeBetTxData.data.args,
      chainId: chainId,
      value: placeBetTxData.extraData.getValue(params.betAmount + vrfCost),
    })

    setCurrentBetRequest(null)
  }, [
    currentBetRequest,
    vrfCost,
    isLoadingVrfCost,
    vrfCostError,
    chainId,
    writeContract,
  ])

  const isActive = isLoadingVrfCost || isTransactionPending

  return {
    placeBet,
    isPlacingBet: isActive,
    betError: vrfCostError || transactionError || prepareBetError,
    transactionHash,
  }
}
