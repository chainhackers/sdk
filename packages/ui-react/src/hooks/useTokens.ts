import {
  type CasinoToken,
  getCasinoTokensFunctionData,
  parseRawCasinoToken,
  type RawCasinoToken,
} from "@betswirl/sdk-core"
import { useMemo } from "react"
import { type Address } from "viem"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"
import { createLogger, type Logger } from "../lib/logger"
import { getTokenImage } from "../lib/utils"
import { type CasinoTokenWithImage, type QueryParameter } from "../types/types"
import { type FilterTokensResult, filterTokensByAllowed } from "../utils/tokenUtils"

const logger = createLogger("useTokens")

/**
 * Formats tokens for logging purposes
 * @param tokens - Array of tokens to format
 * @returns Array of objects with symbol and address for logging
 */
function formatTokensForLogging(tokens: CasinoTokenWithImage[]) {
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
  availableTokens: CasinoTokenWithImage[],
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
  if (filterResult.filtered.length === 0 && availableTokens.length > 0) {
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
  tokens: CasinoTokenWithImage[]
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch casino tokens with optional filtering and validation
 *
 * @param props.onlyActive - Only return active (non-paused) tokens
 * @param props.query - Optional query parameters for React Query
 * @returns Object containing tokens array, loading state, and error
 */
export function useTokens(props: UseTokensProps = {}): UseTokensResult {
  const { onlyActive = true, query } = props
  const { appChainId } = useChain()
  const { filteredTokens } = useBettingConfig()

  const functionData = useMemo(() => {
    if (!appChainId) return null
    return getCasinoTokensFunctionData(appChainId)
  }, [appChainId])

  const {
    data: rawTokens,
    isLoading,
    error,
  } = useReadContract({
    abi: functionData?.data.abi,
    address: functionData?.data.to,
    functionName: functionData?.data.functionName,
    args: functionData?.data.args,
    chainId: appChainId,
    query: {
      enabled: !!appChainId && !!functionData,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      ...(query as any), // Cast to any to avoid type conflicts with the generic query param
    },
  })

  const casinoTokens = useMemo(() => {
    if (!rawTokens) return []
    return (rawTokens as RawCasinoToken[])
      .map((rawToken) => parseRawCasinoToken(rawToken, appChainId))
      .filter((token) => (onlyActive ? !token.paused : true))
  }, [rawTokens, appChainId, onlyActive])

  const tokensWithImage: CasinoTokenWithImage[] = useMemo(
    () =>
      casinoTokens.map((token) => ({
        ...token,
        image: getTokenImage(token.symbol),
      })),
    [casinoTokens],
  )

  // Apply filtering if filteredTokens is provided
  const finalTokens = useMemo(() => {
    if (!filteredTokens) {
      return tokensWithImage
    }

    const filterResult = filterTokensByAllowed(tokensWithImage, filteredTokens)

    const shouldValidate = tokensWithImage.length > 0 && !isLoading && !error
    if (shouldValidate) {
      validateTokenFiltering(filterResult, tokensWithImage, filteredTokens, logger)
    }

    return filterResult.filtered
  }, [tokensWithImage, filteredTokens, isLoading, error])

  return {
    tokens: finalTokens,
    loading: isLoading,
    error: error as Error | null,
  }
}
