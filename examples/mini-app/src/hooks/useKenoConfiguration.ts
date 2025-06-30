import {
  KenoConfiguration,
  type RawKenoConfiguration,
  getKenoConfigurationFunctionData,
  parseRawKenoConfiguration,
} from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { TokenWithImage } from "../types/types"

type UseKenoConfigurationProps = {
  token: TokenWithImage
  query?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    refetchOnWindowFocus?: boolean
  }
}

type UseKenoConfigurationResult = {
  wagmiHook: ReturnType<typeof useReadContract>
  config: KenoConfiguration | undefined
  loading: boolean
  error: Error | null
}

/**
 * Fetches Keno game configuration from the smart contract.
 * Configuration includes maximum selectable balls, biggest selectable ball number,
 * and multiplier table for different number combinations.
 *
 * @param props.token - Token for which to fetch Keno configuration
 * @param props.query - Optional query settings (refetchInterval, enabled, etc.)
 * @returns Keno configuration with loading and error states
 * @returns config - Keno configuration object with game parameters
 * @returns loading - Whether the configuration is currently being fetched
 * @returns error - Error object if configuration fetch failed
 *
 * @example
 * ```ts
 * const { config, loading, error } = useKenoConfiguration({
 *   token: degenToken,
 *   query: { enabled: !!token }
 * })
 * if (config) {
 *   console.log('Max selectable balls:', config.maxSelectableBalls)
 *   console.log('Multiplier table:', config.mutliplierTable)
 * }
 * ```
 */
export function useKenoConfiguration(props: UseKenoConfigurationProps): UseKenoConfigurationResult {
  const { appChainId } = useChain()
  const { token, query = {} } = props

  const functionData = useMemo(() => {
    return getKenoConfigurationFunctionData(token.address, appChainId)
  }, [token.address, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      staleTime: query?.staleTime ?? 5 * 60 * 1000, // 5 minutes - configuration rarely changes
      refetchOnWindowFocus: query?.refetchOnWindowFocus ?? false,
      enabled: query?.enabled,
      refetchInterval: query?.refetchInterval,
    },
  })

  const config = useMemo(() => {
    if (!wagmiHook.data) return undefined
    return parseRawKenoConfiguration(wagmiHook.data as RawKenoConfiguration, token, appChainId)
  }, [wagmiHook.data, token, appChainId])

  return {
    wagmiHook,
    config,
    loading: wagmiHook.isLoading || wagmiHook.isFetching,
    error: wagmiHook.error as Error | null,
  }
}
