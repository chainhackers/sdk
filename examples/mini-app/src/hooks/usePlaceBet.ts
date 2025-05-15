import { createContext, useContext } from "react"
import { Chain, Hex, zeroAddress, decodeAbiParameters } from "viem"
import { usePublicClient, useWriteContract } from "wagmi"

import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
  getChainlinkVrfCostFunctionData,
} from "@betswirl/sdk-core"

import { CHAIN } from "../providers.tsx"

export const BetContext = createContext<{
  chain: Chain & { id: CasinoChainId }
}>({ chain: CHAIN })

export function usePlaceBet() {
  const { chain } = useContext(BetContext)
  const publicClient = usePublicClient({ chainId: chain.id })
  const {
    data: transactionHash,
    isPending: isPlacingBetInternal,
    error: betErrorInternal,
    writeContract,
    reset,
  } = useWriteContract()

  const placeBet = async (betParams: GenericCasinoBetParams, receiver: Hex) => {
    reset()

    if (!publicClient) {
      throw new Error("Public client is not available for the current chain.")
    }
    if (!receiver) {
      throw new Error("Receiver address (user address) is not available.")
    }

    const vrfFunctionData = getChainlinkVrfCostFunctionData(
      betParams.game,
      zeroAddress,
      1,
      chain.id,
    )
    console.log({ vrfFunctionData })

    const currentGasPrice = await publicClient.getGasPrice()
    console.log({ currentGasPrice })
    const effectiveGasPrice = (currentGasPrice * 120n) / 100n
    console.log({ effectiveGasPrice })

    const vrfCallResult = await publicClient.call({
      to: vrfFunctionData.data.to,
      data: vrfFunctionData.encodedData,
      gasPrice: effectiveGasPrice,
    })
    console.log({ vrfCallResult })

    if (vrfCallResult.data === undefined) {
      console.error(
        "Failed to retrieve VRF cost: contract call returned no data.",
        { vrfFunctionData, vrfCallResult },
      )
      throw new Error(
        "Failed to retrieve VRF cost: contract call returned no data.",
      )
    }

    const vrfCost = decodeAbiParameters(
      [{ type: "uint256" }],
      vrfCallResult.data,
    )[0] as bigint
    console.log({ vrfCost })

    if (typeof vrfCost !== "bigint") {
      console.error("Failed to decode VRF cost or result is not a bigint.", {
        vrfCostRaw: vrfCallResult.data,
        decodedVrfCost: vrfCost,
      })
      throw new Error("Failed to decode VRF cost or result is not a bigint.")
    }

    const placeBetTxData = getPlaceBetFunctionData(
      {
        ...betParams,
        tokenAddress: zeroAddress,
        receiver,
      },
      chain.id,
    )

    writeContract({
      abi: placeBetTxData.data.abi,
      address: placeBetTxData.data.to,
      functionName: placeBetTxData.data.functionName,
      args: placeBetTxData.data.args,
      chainId: chain.id,
      value: placeBetTxData.extraData.getValue(betParams.betAmount + vrfCost),
    })
  }

  return {
    placeBet,
    isPlacingBet: isPlacingBetInternal,
    betError: betErrorInternal,
    transactionHash,
    resetWriteContractState: reset,
  }
}
