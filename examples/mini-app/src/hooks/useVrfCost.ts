import { useState, useCallback } from "react"
import { Hex, zeroAddress, Abi } from "viem"
import { useReadContract } from "wagmi"
import {
  CASINO_GAME_TYPE,
  CasinoChainId,
  getChainlinkVrfCostFunctionData,
} from "@betswirl/sdk-core"

interface UseVrfCostProps {
  chainId: CasinoChainId
}

interface VrfContractCallParams {
  address: Hex | undefined
  abi: Abi | undefined
  functionName: string | undefined
  args: readonly unknown[] | undefined
}

export function useVrfCost({ chainId }: UseVrfCostProps) {
  const [contractCallParams, setContractCallParams] =
    useState<VrfContractCallParams | null>(null)

  const {
    data: rawVrfCost,
    error: vrfCostError,
    isLoading: isLoadingVrfCost,
  } = useReadContract({
    address: contractCallParams?.address,
    abi: contractCallParams?.abi,
    functionName: contractCallParams?.functionName,
    args: contractCallParams?.args,
    chainId: chainId,
    query: {
      enabled: !!contractCallParams?.address && !!contractCallParams?.abi,
    },
  })

  const getVrfCost = useCallback(
    (
      gameType: CASINO_GAME_TYPE,
      betCount: number = 1,
      tokenAddress: Hex = zeroAddress,
    ) => {
      const vrfFunctionData = getChainlinkVrfCostFunctionData(
        gameType,
        tokenAddress,
        betCount,
        chainId,
      )

      setContractCallParams({
        address: vrfFunctionData.data.to,
        abi: vrfFunctionData.data.abi,
        functionName: vrfFunctionData.data.functionName,
        args: vrfFunctionData.data.args,
      })
    },
    [chainId],
  )

  const resetVrfCostState = useCallback(() => {
    setContractCallParams(null)
  }, [])

  const vrfCost = typeof rawVrfCost === "bigint" ? rawVrfCost : undefined

  return {
    vrfCost,
    isLoadingVrfCost,
    vrfCostError,
    fetchVrfCost: getVrfCost,
    resetVrfCostState,
  }
}
