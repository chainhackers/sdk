import { Token, getAllowanceFunctionData, getApproveFunctionData } from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo } from "react"
import { Address, maxUint256 } from "viem"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"

type UseTokenAllowanceProps = {
  token?: Token
  spender: Address
  amount: bigint
  enabled?: boolean
}

/**
 * Hook to check and manage token allowances for betting.
 * Automatically prompts for approval when allowance is insufficient.
 *
 * @param props.token - Token to check allowance for
 * @param props.spender - Contract address that will spend the tokens
 * @param props.amount - Amount of tokens needed
 * @param props.enabled - Whether to enable the hook (default: true)
 * @returns
 * - allowance: Current allowance amount
 * - needsApproval: Whether approval is needed
 * - approve: Function to approve max amount
 * - isApproving: Whether approval is in progress
 * - isSuccess: Whether approval was successful
 *
 * @example
 * ```ts
 * const { needsApproval, approve, isApproving } = useTokenAllowance({
 *   token: selectedToken,
 *   spender: gameContractAddress,
 *   amount: betAmount
 * })
 *
 * if (needsApproval) {
 *   await approve()
 * }
 * ```
 */
export function useTokenAllowance(props: UseTokenAllowanceProps) {
  const { token, spender, amount, enabled = true } = props
  const { appChainId } = useChain()
  const { address: userAddress } = useAccount()
  const { bankrollToken } = useBettingConfig()

  // Use bankroll token if no token is provided
  const effectiveToken = token || bankrollToken

  // Check if this is a native token (no approval needed)
  const isNativeToken = useMemo(() => {
    return (
      !effectiveToken?.address ||
      effectiveToken.address === "0x0000000000000000000000000000000000000000"
    )
  }, [effectiveToken])

  // Get current allowance
  const allowanceFunctionData = useMemo(() => {
    if (!effectiveToken?.address || !userAddress || isNativeToken) return null
    return getAllowanceFunctionData(effectiveToken.address as Address, userAddress, spender)
  }, [effectiveToken, userAddress, spender, isNativeToken])

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: allowanceFunctionData?.data.abi,
    address: allowanceFunctionData?.data.to,
    functionName: allowanceFunctionData?.data.functionName,
    args: allowanceFunctionData?.data.args,
    chainId: appChainId,
    query: {
      enabled: enabled && !!allowanceFunctionData && !isNativeToken,
    },
  })

  const allowance = (allowanceData as bigint | undefined) ?? 0n

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (isNativeToken) return false
    return allowance < amount
  }, [allowance, amount, isNativeToken])

  // Prepare approve function data
  const approveFunctionData = useMemo(() => {
    if (!effectiveToken?.address || isNativeToken) return null
    // Approve max amount to avoid multiple approvals
    return getApproveFunctionData(effectiveToken.address as Address, spender, maxUint256)
  }, [effectiveToken, spender, isNativeToken])

  // Write contract for approval
  const {
    writeContract,
    data: approveTxHash,
    isPending: isApproving,
    reset: resetApproval,
  } = useWriteContract()

  // Wait for approval transaction
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: appChainId,
  })

  // Refetch allowance after successful approval
  const handleApprovalSuccess = useCallback(async () => {
    await refetchAllowance()
    resetApproval()
  }, [refetchAllowance, resetApproval])

  // Approve function
  const approve = useCallback(async () => {
    if (!approveFunctionData) return

    try {
      await writeContract({
        abi: approveFunctionData.data.abi,
        address: approveFunctionData.data.to,
        functionName: approveFunctionData.data.functionName,
        args: approveFunctionData.data.args,
        chainId: appChainId,
      })
    } catch (error) {
      console.error("Error approving token:", error)
      throw error
    }
  }, [approveFunctionData, writeContract, appChainId])

  // Handle successful approval
  useEffect(() => {
    if (isSuccess && !isConfirming) {
      handleApprovalSuccess()
    }
  }, [isSuccess, isConfirming, handleApprovalSuccess])

  return {
    allowance,
    needsApproval,
    approve,
    isApproving: isApproving || isConfirming,
    isSuccess,
    effectiveToken,
  }
}
