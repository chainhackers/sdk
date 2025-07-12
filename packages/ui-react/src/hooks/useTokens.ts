import { CasinoToken, getCasinoTokens } from "@betswirl/sdk-core"
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { type Address } from "viem"
import { useConfig } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { createLogger, type Logger } from "../lib/logger"
import { QueryParameter, TokenWithImage } from "../types/types"
import { type FilterTokensResult, filterTokensByAllowed } from "../utils/tokenUtils"

const logger = createLogger("useTokens")

/**
 * Formats tokens for logging purposes
 * @param tokens - Array of tokens to format
 * @returns Array of objects with symbol and address for logging
 */
function formatTokensForLogging(tokens: TokenWithImage[]) {
  return tokens.map((token) => ({ symbol: token.symbol, address: token.address }))
}

/**
 * Validates token filtering results and logs warnings if issues are found
 * @param filterResult - Result from filterTokensByAllowed function
 * @param availableTokens - Array of available tokens
 * @param filteredTokenAddresses - Array of addresses used for filtering
 * @param logger - Logger instance for warnings
 */
function validateTokenFiltering(
  filterResult: FilterTokensResult,
  availableTokens: TokenWithImage[],
  filteredTokenAddresses: Address[],
  logger: Logger,
): void {
  // Warn about unmatched addresses from filteredTokens
  if (filterResult.unmatched.length > 0) {
    const unmatchedAddresses = filterResult.unmatched.join(", ")
    logger.warn(
      `Some token addresses from filteredTokens were not found in available tokens: ${unmatchedAddresses}`,
      {
        unmatchedAddresses: filterResult.unmatched,
        availableTokens: formatTokensForLogging(availableTokens),
      },
    )
  }

  // Warn if filtering resulted in empty list when tokens are available
  if (filterResult.filtered.length === 0) {
    logger.warn(
      "Token filtering resulted in empty list. Check if filteredTokens configuration is correct.",
      {
        filteredTokensCount: filteredTokenAddresses.length,
        availableTokensCount: availableTokens.length,
        filteredTokenAddresses,
        availableTokens: formatTokensForLogging(availableTokens),
      },
    )
  }
}

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
 * Hook to fetch casino tokens with optional filtering and validation
 *
 * @param onlyActive - Only return active (non-paused) tokens
 * @param query - Optional query parameters for React Query
 * @returns Object containing tokens array, loading state, and error
 *
 * The hook now includes enhanced validation for filteredTokens configuration:
 * - Warns when token addresses in filteredTokens are not found in available tokens
 * - Warns when filtering results in an empty list despite available tokens
 *
 * @example
 * ```ts
 * const { tokens, loading, error } = useTokens({
 *   onlyActive: true
 * })
 * ```
 *
 * @example
 * ```ts
 * // With filteredTokens in BettingConfig context:
 * // If filteredTokens contains non-existent addresses, warnings will be logged
 * const { tokens } = useTokens() // Automatically uses filteredTokens from context
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
      // Create a modified wallet that uses the app chain ID
      const wallet = new WagmiBetSwirlWallet(wagmiConfig)

      // Store the original getChainId method
      const originalGetChainId = wallet.getChainId.bind(wallet)

      // Override getChainId to return the app chain
      wallet.getChainId = () => appChainId

      try {
        return await getCasinoTokens(wallet, onlyActive)
      } finally {
        // Restore original method
        wallet.getChainId = originalGetChainId
      }
    },
    enabled: !!appChainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
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
  const finalTokens = useMemo(() => {
    if (!filteredTokens) {
      return tokens
    }

    const filterResult = filterTokensByAllowed(tokens, filteredTokens)

    // Only validate and show warnings if tokens have been loaded and query is successful
    // (to avoid false positives during loading or when there are errors)
    const shouldValidate = tokens.length > 0 && !tokensQuery.isLoading && !tokensQuery.error
    if (shouldValidate) {
      validateTokenFiltering(filterResult, tokens, filteredTokens, logger)
    }

    return filterResult.filtered
  }, [tokens, filteredTokens, tokensQuery.isLoading, tokensQuery.error])

  return {
    tokens: finalTokens,
    loading: tokensQuery.isLoading,
    error: tokensQuery.error,
  }
}
