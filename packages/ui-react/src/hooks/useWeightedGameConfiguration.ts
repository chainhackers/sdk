import {
  getWeightedGameConfigurationFunctionData,
  WeightedGameConfiguration,
  parseRawWeightedGameConfiguration,
  type RawWeightedGameConfiguration,
  CASINO_GAME_TYPE,
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
export function useWeightedGameConfiguration(props: UseWeightedGameConfigurationProps): UseWeightedGameConfigurationResult {
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
      appChainId
    )

    console.log({ rawConfig })

    // Add game-specific enrichment based on rawConfig.game (Single Source of Truth)
    if (rawConfig.game === CASINO_GAME_TYPE.WHEEL) {
      // For wheel, we need colors - use cached configuration colors if available
      const baseWheelColors = [
        "#29384C",
        "#55DC36",
        "#29384C",
        "#15A2D8",
        "#29384C",
        "#7340F4",
        "#29384C",
        "#55DC36",
        "#29384C",
        "#EC9E3C",
      ]

      // Ensure we have enough colors for all segments by repeating the pattern if needed
      const wheelColors: string[] = []
      for (let i = 0; i < rawConfig.multipliers.length; i++) {
        wheelColors.push(baseWheelColors[i % baseWheelColors.length])
      }

      console.log({ wheelColors })

      return {
        ...rawConfig,
        colors: wheelColors,
        label: "Normal" // Could be enhanced to fetch from contract or cache
      }
    }

    // For other game types, return rawConfig as-is
    return rawConfig
  }, [wagmiHook.data, configId, appChainId])

  return {
    wagmiHook,
    config,
    loading: wagmiHook.isLoading || wagmiHook.isFetching,
    error: wagmiHook.error as Error | null,
  }
}
