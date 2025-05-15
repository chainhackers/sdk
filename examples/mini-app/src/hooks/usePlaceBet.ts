import { Hex, zeroAddress } from "viem"
import { useWriteContract } from "wagmi"

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

export function usePlaceBet({ chainId = CHAIN.id }: UsePlaceBetProps = {}) {
  const {
    data: transactionHash,
    isPending: isTransactionPending,
    error: transactionError,
    writeContract,
    reset: resetWriteContract,
  } = useWriteContract()

  const { isLoadingVrfCost, vrfCostError, fetchVrfCost, resetVrfCostState } =
    useVrfCost({ chainId })

  const isActive = isLoadingVrfCost || isTransactionPending

  const placeBet = async (betParams: GenericCasinoBetParams, receiver: Hex) => {
    resetWriteContract()
    resetVrfCostState()

    const fetchedVrfCost = await fetchVrfCost(betParams.game, 1, zeroAddress)

    if (fetchedVrfCost === null) {
      console.error(
        "usePlaceBet: Failed to fetch VRF cost. Error should be in vrfCostError from useVrfCost hook.",
      )
      return
    }

    const placeBetTxData = getPlaceBetFunctionData(
      {
        ...betParams,
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
      value: placeBetTxData.extraData.getValue(
        betParams.betAmount + fetchedVrfCost,
      ),
    })
  }

  return {
    placeBet,
    isPlacingBet: isActive,
    betError: vrfCostError || transactionError,
    transactionHash,
  }
}
