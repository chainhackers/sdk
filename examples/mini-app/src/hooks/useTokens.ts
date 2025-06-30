import { CasinoToken, getCasinoTokens } from "@betswirl/sdk-core"
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useConfig } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { QueryParameter, TokenWithImage } from "../types/types"
import { filterTokensByAllowed } from "../utils/tokenUtils"

type UseTokensProps = {
  onlyActive?: boolean
  query?: QueryParameter<CasinoToken[]>
}

type UseTokensResult = {
  tokens: TokenWithImage[]
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch casino tokens with optional filtering
 *
 * @param onlyActive - Only return active (non-paused) tokens
 * @param query - Optional query parameters for React Query
 * @returns Object containing tokens array, loading state, and error
 *
 * @example
 * ```ts
 * const { tokens, loading, error } = useTokens({
 *   onlyActive: true
 * })
 * ```
 */
export function useTokens(props: UseTokensProps = {}): UseTokensResult {
  const { onlyActive = true, query } = props
  const { appChainId } = useChain()
  const { filteredTokens } = useBettingConfig()
  const wagmiConfig = useConfig()

  const tokensQuery = useQuery({
    queryKey: ["casino-tokens", appChainId, onlyActive],
    queryFn: async () => {
      const wallet = new WagmiBetSwirlWallet(wagmiConfig)
      return await getCasinoTokens(wallet, onlyActive)
    },
    enabled: !!appChainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...query,
  })

  const tokens: TokenWithImage[] = useMemo(
    () =>
      tokensQuery.data?.map((token) => ({
        ...token,
        image: `https://www.betswirl.com/img/tokens/${token.symbol}.svg`,
      })) || [],
    [tokensQuery.data],
  )

  // Apply filtering if filteredTokens is provided
  const finalTokens = useMemo(
    () => (filteredTokens ? filterTokensByAllowed(tokens, filteredTokens) : tokens),
    [tokens, filteredTokens],
  )

  return {
    tokens: finalTokens,
    loading: tokensQuery.isLoading,
    error: tokensQuery.error,
  }
}
