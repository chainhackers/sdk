import { getAllowanceFunctionData, getApproveFunctionData, Token } from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo } from "react"
import { Address, maxUint256, zeroAddress } from "viem"
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useChain } from "../context/chainContext"

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

  // Check if this is a native token (no approval needed)
  const isNativeToken = !token?.address || token.address === zeroAddress

  // Get current allowance
  const allowanceFunctionData = useMemo(() => {
    if (!token?.address || !userAddress || isNativeToken) return null
    return getAllowanceFunctionData(token.address as Address, userAddress, spender)
  }, [token, userAddress, spender, isNativeToken])

  const allowanceReadWagmiHook = useReadContract({
    abi: allowanceFunctionData?.data.abi,
    address: allowanceFunctionData?.data.to,
    functionName: allowanceFunctionData?.data.functionName,
    args: allowanceFunctionData?.data.args,
    chainId: appChainId,
    query: {
      enabled: enabled && !!allowanceFunctionData && !isNativeToken,
    },
  })

  const allowance = (allowanceReadWagmiHook.data as bigint | undefined) ?? 0n

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (isNativeToken) return false
    if (allowanceReadWagmiHook.isRefetching) return false // Don't show "needs approval" while refetching
    return allowance < amount
  }, [allowance, amount, isNativeToken, allowanceReadWagmiHook.isRefetching])

  // Prepare approve function data
  const approveFunctionData = useMemo(() => {
    if (!token?.address || isNativeToken) return null
    // Approve max amount to avoid multiple approvals
    return getApproveFunctionData(token.address as Address, spender, maxUint256)
  }, [token, spender, isNativeToken])

  // Write contract for approval
  const approveWriteWagmiHook = useWriteContract()

  // Wait for approval transaction
  const approveWaitingWagmiHook = useWaitForTransactionReceipt({
    hash: approveWriteWagmiHook.data,
    chainId: appChainId,
  })

  // Reset function to clear approval errors
  const resetApprovalState = useCallback(() => {
    approveWriteWagmiHook.reset()
  }, [approveWriteWagmiHook.reset])

  // Refetch allowance after successful approval
  const handleApprovalSuccess = useCallback(async () => {
    try {
      await allowanceReadWagmiHook.refetch()
    } finally {
      resetApprovalState()
    }
  }, [allowanceReadWagmiHook.refetch, resetApprovalState])

  // Approve function
  const approve = useCallback(async () => {
    if (!approveFunctionData) return

    await approveWriteWagmiHook.writeContract({
      abi: approveFunctionData.data.abi,
      address: approveFunctionData.data.to,
      functionName: approveFunctionData.data.functionName,
      args: approveFunctionData.data.args,
      chainId: appChainId,
    })
  }, [approveFunctionData, approveWriteWagmiHook.writeContract, appChainId])

  // Handle successful approval
  useEffect(() => {
    if (approveWaitingWagmiHook.isSuccess && !approveWaitingWagmiHook.isPending) {
      handleApprovalSuccess()
    }
  }, [approveWaitingWagmiHook.isSuccess, approveWaitingWagmiHook.isPending, handleApprovalSuccess])

  // Handle approval errors
  useEffect(() => {
    if (approveWriteWagmiHook.error) {
      console.error("Token approval error:", approveWriteWagmiHook.error)
    }
  }, [approveWriteWagmiHook.error])

  // Handle transaction wait errors
  useEffect(() => {
    if (approveWaitingWagmiHook.error) {
      console.error("Token approval transaction error:", approveWaitingWagmiHook.error)
    }
  }, [approveWaitingWagmiHook.error])

  return {
    allowance,
    needsApproval,
    approve,
    effectiveToken: token,
    resetApprovalState,
    approveWriteWagmiHook,
    approveWaitingWagmiHook,
    allowanceReadWagmiHook,
  }
}
