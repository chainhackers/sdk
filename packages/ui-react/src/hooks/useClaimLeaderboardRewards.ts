import {
  type Leaderboard,
  claimLeaderboardRewards,
  type BetSwirlWallet,
  getClaimableAmount,
} from "@betswirl/sdk-core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type Address, type TransactionReceipt } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { useChain } from "../context/chainContext"

interface ClaimLeaderboardRewardsParams {
  leaderboard: Leaderboard
  receiver?: Address
}

interface LeaderboardClaimRewardsResult {
  claimedAmount: bigint
  token: {
    address: Address
    symbol: string
    decimals: number
  }
  receiver: Address
}

interface ClaimLeaderboardRewardsResult {
  receipt: TransactionReceipt
  result: LeaderboardClaimRewardsResult
}

/**
 * Hook for claiming leaderboard rewards
 * Uses TanStack Query's useMutation for handling async state
 */
export function useClaimLeaderboardRewards() {
  const { address } = useAccount()
  const { appChainId } = useChain()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient({ chainId: appChainId })
  const { data: walletClient } = useWalletClient({ chainId: appChainId })

  const mutation = useMutation<
    ClaimLeaderboardRewardsResult,
    Error,
    ClaimLeaderboardRewardsParams
  >({
    mutationFn: async ({ leaderboard, receiver }) => {
      if (!publicClient) {
        throw new Error("Public client not initialized")
      }

      if (!walletClient) {
        throw new Error("Wallet not connected")
      }

      if (!address && !receiver) {
        throw new Error("No wallet connected and no receiver address provided")
      }

      const targetAddress = receiver || address!

      // Create a BetSwirl wallet wrapper for SDK functions
      // This follows the same pattern as other hooks in the project
      const wallet = { publicClient, walletClient } as unknown as BetSwirlWallet

      // First check if there's anything to claim
      const claimableAmount = await getClaimableAmount(
        wallet,
        leaderboard.onChainId,
        targetAddress,
        appChainId
      )

      if (claimableAmount <= 0n) {
        throw new Error("No rewards to claim")
      }

      // Call the SDK function to claim rewards
      // The function handles the transaction submission and waiting
      const result = await claimLeaderboardRewards(
        wallet,
        leaderboard,
        targetAddress,
        5000 // polling interval in ms
      )

      return result
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after successful claim
      // This will trigger refetch of leaderboard data to update UI
      queryClient.invalidateQueries({
        queryKey: ["leaderboards"]
      })
      queryClient.invalidateQueries({
        queryKey: ["leaderboardDetails", variables.leaderboard.id]
      })
      // Also invalidate user balance queries if they exist
      queryClient.invalidateQueries({
        queryKey: ["balances"]
      })
    },
    onError: (error) => {
      console.error("Failed to claim leaderboard rewards:", error)
    },
  })

  return {
    claim: mutation.mutate,
    claimAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  }
}
