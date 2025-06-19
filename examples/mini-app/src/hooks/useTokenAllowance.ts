import { Token, getAllowanceFunctionData, getApproveFunctionData } from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Address, maxUint256, zeroAddress } from "viem"
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
 * - isApprovePending: Whether user needs to sign the approval transaction
 * - isApproveConfirming: Whether approval transaction is being confirmed on-chain
 * - isSuccess: Whether approval was successful
 *
 * @example
 * ```ts
 * const { needsApproval, approve, isApprovePending, isApproveConfirming } = useTokenAllowance({
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
  const [isRefetchingAllowance, setIsRefetchingAllowance] = useState(false)

  // Use bankroll token if no token is provided
  const effectiveToken = token || bankrollToken

  // Check if this is a native token (no approval needed)
  const isNativeToken = !effectiveToken?.address || effectiveToken.address === zeroAddress

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
    if (isRefetchingAllowance) return false // Don't show "needs approval" while refetching
    return allowance < amount
  }, [allowance, amount, isNativeToken, isRefetchingAllowance])

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
    isPending: isApprovePending,
    reset: resetApproval,
    error: approveError,
  } = useWriteContract()

  // Wait for approval transaction
  const {
    isSuccess,
    isLoading: isApproveConfirming,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: appChainId,
  })

  // Refetch allowance after successful approval
  const handleApprovalSuccess = useCallback(async () => {
    setIsRefetchingAllowance(true)
    try {
      await refetchAllowance()
    } finally {
      setIsRefetchingAllowance(false)
      resetApproval()
    }
  }, [refetchAllowance, resetApproval])

  // Approve function
  const approve = useCallback(async () => {
    if (!approveFunctionData) return

    await writeContract({
      abi: approveFunctionData.data.abi,
      address: approveFunctionData.data.to,
      functionName: approveFunctionData.data.functionName,
      args: approveFunctionData.data.args,
      chainId: appChainId,
    })
  }, [approveFunctionData, writeContract, appChainId])

  // Handle successful approval
  useEffect(() => {
    if (isSuccess && !isApproveConfirming) {
      handleApprovalSuccess()
    }
  }, [isSuccess, isApproveConfirming, handleApprovalSuccess])

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error("Token approval error:", approveError)
    }
  }, [approveError])

  // Handle transaction wait errors
  useEffect(() => {
    if (waitError) {
      console.error("Token approval transaction error:", waitError)
    }
  }, [waitError])

  // Reset function to clear approval errors
  const resetApprovalError = useCallback(() => {
    resetApproval()
  }, [resetApproval])

  return {
    allowance,
    needsApproval,
    approve,
    isApprovePending,
    isApproveConfirming,
    isSuccess,
    effectiveToken,
    isRefetchingAllowance,
    approveError,
    waitError,
    resetApprovalError,
  }
}
