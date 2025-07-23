import { getCasinoTokens } from "@betswirl/sdk-core"
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider"
import { useQueries } from "@tanstack/react-query"
import { useConfig } from "wagmi"
import { useChain } from "../context/chainContext"

/**
 * Hook to prefetch tokens for all available chains in the background.
 * This ensures instant chain switching by having all token data cached.
 *
 * @returns Array of query results for each chain
 */
export function useAllChainsTokens() {
  const { availableChains } = useChain()
  const wagmiConfig = useConfig()

  // Create queries for each available chain
  const queries = useQueries({
    queries: availableChains.map((chain) => ({
      queryKey: ["casino-tokens", chain.viemChain.id, true], // Only fetch active tokens
      queryFn: async () => {
        // Create a modified wallet that uses the specific chain ID
        const wallet = new WagmiBetSwirlWallet(wagmiConfig)

        // Store the original getChainId method
        const originalGetChainId = wallet.getChainId.bind(wallet)

        // Override getChainId to return the specific chain
        wallet.getChainId = () => chain.viemChain.id

        try {
          return await getCasinoTokens(wallet, true)
        } finally {
          // Restore original method
          wallet.getChainId = originalGetChainId
        }
      },
      enabled: true,
      staleTime: 10 * 60 * 1000, // 10 minutes - tokens don't change often
      gcTime: 30 * 60 * 1000, // 30 minutes cache - keep data longer in memory
    })),
  })

  return queries
}
