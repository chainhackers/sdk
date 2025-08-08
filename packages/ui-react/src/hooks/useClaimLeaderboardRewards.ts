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

      const wallet = { publicClient, walletClient } as unknown as BetSwirlWallet

      const claimableAmount = await getClaimableAmount(
        wallet,
        leaderboard.onChainId,
        targetAddress,
        appChainId
      )

      if (claimableAmount <= 0n) {
        throw new Error("No rewards to claim")
      }

      const result = await claimLeaderboardRewards(
        wallet,
        leaderboard,
        targetAddress,
        5000
      )

      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboards"]
      })
      queryClient.invalidateQueries({
        queryKey: ["leaderboardDetails", variables.leaderboard.id]
      })
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
