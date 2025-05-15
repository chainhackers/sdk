import { useState } from "react"
import { Hex, zeroAddress, decodeAbiParameters } from "viem"
import { usePublicClient } from "wagmi"
import {
  CASINO_GAME_TYPE,
  CasinoChainId,
  getChainlinkVrfCostFunctionData,
} from "@betswirl/sdk-core"

interface UseVrfCostProps {
  chainId: CasinoChainId
}

export function useVrfCost({ chainId }: UseVrfCostProps) {
  const publicClient = usePublicClient({ chainId })

  const [vrfCost, setVrfCost] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchVrfCost = async (
    gameType: CASINO_GAME_TYPE,
    numWords: number = 1,
    tokenAddress: Hex = zeroAddress,
  ) => {
    setIsLoading(true)
    setError(null)
    setVrfCost(null)

    if (!publicClient) {
      const err = new Error(
        "Public client is not available for the current chain.",
      )
      setError(err)
      setIsLoading(false)
      console.error("useVrfCost:", err.message)
      return null
    }

    const vrfFunctionData = getChainlinkVrfCostFunctionData(
      gameType,
      tokenAddress,
      numWords,
      chainId,
    )

    const currentGasPrice = await publicClient.getGasPrice()
    const effectiveGasPrice = (currentGasPrice * 120n) / 100n

    const vrfCallResult = await publicClient.call({
      to: vrfFunctionData.data.to,
      data: vrfFunctionData.encodedData,
      gasPrice: effectiveGasPrice,
    })

    if (vrfCallResult.data === undefined) {
      const err = new Error(
        "Failed to retrieve VRF cost: contract call returned no data.",
      )
      setError(err)
      setIsLoading(false)
      console.error("useVrfCost:", err.message, {
        vrfFunctionData,
        vrfCallResult,
      })
      return null
    }

    const decodedCost = decodeAbiParameters(
      [{ type: "uint256" }],
      vrfCallResult.data,
    )[0] as bigint

    setVrfCost(decodedCost)
    setIsLoading(false)
    return decodedCost
  }

  const resetVrfCostState = () => {
    setVrfCost(null)
    setIsLoading(false)
    setError(null)
  }

  return {
    vrfCost,
    isLoadingVrfCost: isLoading,
    vrfCostError: error,
    fetchVrfCost,
    resetVrfCostState,
  }
}
