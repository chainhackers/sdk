import { getClaimableAmountFunctionData, type Leaderboard } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { type Address } from "viem"
import { useAccount, useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"

export interface UseClaimableLeaderboardAmountProps {
  leaderboard?: Leaderboard
  playerAddress?: Address
  enabled?: boolean
}

export function useClaimableLeaderboardAmount(props: UseClaimableLeaderboardAmountProps) {
  const { leaderboard, enabled = true } = props
  const { address: connectedAddress } = useAccount()
  const playerAddress = props.playerAddress ?? connectedAddress
  const { appChainId } = useChain()

  const functionData = useMemo(() => {
    if (!enabled || !leaderboard || !playerAddress) return null
    return getClaimableAmountFunctionData(playerAddress, leaderboard.onChainId, appChainId)
  }, [enabled, leaderboard, playerAddress, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData?.data.abi,
    address: functionData?.data.to,
    functionName: functionData?.data.functionName,
    args: functionData?.data.args,
    chainId: appChainId,
    query: { enabled: enabled && !!functionData },
  })

  const claimableAmount = (wagmiHook.data as bigint | undefined) ?? undefined

  return {
    wagmiHook,
    claimableAmount,
  }
}
