import { getClaimRewardsLeaderboardFunctionData, type Leaderboard } from "@betswirl/sdk-core"
import { useMutation } from "@tanstack/react-query"
import { type Address } from "viem"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"

interface ClaimLeaderboardRewardsParams {
  leaderboard: Leaderboard
  receiver?: Address
}

/**
 * Hook for claiming leaderboard rewards
 * Uses TanStack Query's useMutation for handling async state
 */
export function useClaimLeaderboardRewards() {
  const { address } = useAccount()
  const { appChainId } = useChain()
  const writeHook = useWriteContract()
  const waitHook = useWaitForTransactionReceipt({ hash: writeHook.data, chainId: appChainId })

  const mutation = useMutation<void, Error, ClaimLeaderboardRewardsParams>(
    {
      mutationFn: async ({ leaderboard, receiver }) => {
        if (!address && !receiver) {
          throw new Error("No wallet connected and no receiver address provided")
        }

        const targetAddress = receiver || address!
        const functionData = getClaimRewardsLeaderboardFunctionData(leaderboard, targetAddress)
        await writeHook.writeContractAsync({
          abi: functionData.data.abi,
          address: functionData.data.to,
          functionName: functionData.data.functionName,
          args: functionData.data.args,
          chainId: appChainId,
        })
      },
      onError: (error) => {
        console.error("Failed to claim leaderboard rewards:", error)
      },
    },
  )

  return {
    claim: mutation.mutate,
    claimAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess && waitHook.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: undefined,
    reset: mutation.reset,
    writeHook,
    waitHook,
  }
}
