import {
  CASINO_GAME_TYPE,
  getWeightedGameConfigurationFunctionData,
  parseRawWeightedGameConfiguration,
  type RawWeightedGameConfiguration,
  WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"

type UseWeightedGameConfigurationProps = {
  configId: number
  query?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    refetchOnWindowFocus?: boolean
  }
}

type UseWeightedGameConfigurationResult = {
  wagmiHook: ReturnType<typeof useReadContract>
  config: WeightedGameConfiguration | undefined
  loading: boolean
  error: Error | null
}

const WHEEL_COLORS = [
  "var(--wheel-neutral)",
  "var(--wheel-green)",
  "var(--wheel-neutral)",
  "var(--wheel-blue)",
  "var(--wheel-neutral)",
  "var(--wheel-purple)",
  "var(--wheel-neutral)",
  "var(--wheel-green)",
  "var(--wheel-neutral)",
  "var(--wheel-orange)",
]

/**
 * Fetches Weighted Game (Wheel, Plinko) configuration from the smart contract.
 * Configuration includes weights, multipliers, and game-specific data (colors, labels).
 * The hook automatically determines the game type from blockchain data and applies
 * appropriate enrichment (Single Source of Truth approach).
 *
 * @param props.configId - Configuration ID to fetch
 * @param props.query - Optional query settings (refetchInterval, enabled, etc.)
 * @returns Weighted game configuration with loading and error states
 * @returns config - Weighted game configuration object with game parameters
 * @returns loading - Whether the configuration is currently being fetched
 * @returns error - Error object if configuration fetch failed
 *
 * @example
 * ```ts
 * const { config, loading, error } = useWeightedGameConfiguration({
 *   configId: 0,
 *   query: { enabled: true }
 * })
 * if (config) {
 *   console.log('Game type:', config.game) // Determined from blockchain data
 *   console.log('Weights:', config.weights)
 *   console.log('Multipliers:', config.multipliers)
 *   if (config.colors) {
 *     console.log('Colors:', config.colors) // Added for WHEEL games
 *   }
 * }
 * ```
 */
export function useWeightedGameConfiguration(
  props: UseWeightedGameConfigurationProps,
): UseWeightedGameConfigurationResult {
  const { appChainId } = useChain()
  const { configId, query = {} } = props

  const functionData = useMemo(() => {
    return getWeightedGameConfigurationFunctionData(configId, appChainId)
  }, [configId, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      staleTime: query?.staleTime ?? 10 * 60 * 1000, // 10 minutes - configuration rarely changes
      refetchOnWindowFocus: query?.refetchOnWindowFocus ?? false,
      enabled: query?.enabled,
      refetchInterval: query?.refetchInterval,
    },
  })

  const config = useMemo(() => {
    if (!wagmiHook.data) return undefined

    const rawConfig = parseRawWeightedGameConfiguration(
      wagmiHook.data as RawWeightedGameConfiguration,
      configId,
      appChainId,
    )

    if (rawConfig.game === CASINO_GAME_TYPE.WHEEL) {
      return {
        ...rawConfig,
        colors: WHEEL_COLORS,
      }
    }

    return rawConfig
  }, [wagmiHook.data, configId, appChainId])

  return {
    wagmiHook,
    config,
    loading: wagmiHook.isLoading || wagmiHook.isFetching,
    error: wagmiHook.error as Error | null,
  }
}
