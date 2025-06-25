import { KenoConfiguration, getKenoConfiguration } from "@betswirl/sdk-core"
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider"
import { useQuery } from "@tanstack/react-query"
import { useConfig } from "wagmi"
import { useChain } from "../context/chainContext"
import { QueryParameter, TokenWithImage } from "../types/types"

type UseKenoConfigurationProps = {
  token: TokenWithImage
  query?: QueryParameter<KenoConfiguration>
}

type UseKenoConfigurationResult = {
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
  const config = useConfig()
  const { appChain } = useChain()
  const { token, query = {} } = props

  const queryFn = async (): Promise<KenoConfiguration> => {
    const betswirlWallet = new WagmiBetSwirlWallet(config)
    return getKenoConfiguration(betswirlWallet, token)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["/keno-configuration", token.address, appChain.id],
    queryFn,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - configuration rarely changes
    ...query,
  })

  return {
    config: data,
    loading: isLoading,
    error: error as Error | null,
  }
}
