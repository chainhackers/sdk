import { waitForTransactionReceipt, writeContract } from "@wagmi/core";

import {
  readContract,
  simulateContract,
  type Config as WagmiConfig,
} from "@wagmi/core";
import type { Hash, Hex } from "viem";

import { erc20Abi, zeroAddress } from "viem";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";

export enum ALLOWANCE_TYPE {
  ALWAYS = "ALWAYS",
  AUTO = "AUTO",
  NONE = "NONE",
}

export interface ApproveResult {
  approvedAmount: bigint;
  tokenAddress: Hex;
  allower: Hex;
  spender: Hex;
}

export async function approve(
  wagmiConfig: WagmiConfig,
  tokenAddress: Hex,
  allower: Hex,
  spender: Hex,
  amount: bigint,
  chainId?: number,
  gasPrice?: bigint,
  pollingInterval?: number,
  allowanceType: ALLOWANCE_TYPE = ALLOWANCE_TYPE.AUTO,
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>
) {
  try {
    if (tokenAddress == zeroAddress || allowanceType == ALLOWANCE_TYPE.NONE)
      return { receipt: null, result: null };
    let allowance: null | bigint = null;
    if (allowanceType == ALLOWANCE_TYPE.AUTO) {
      allowance = await readContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [allower, spender],
        chainId,
      });
    }

    if (!allowance || allowance < amount) {
      const amountToApprove = amount - (allowance || 0n);
      const { request: approveRequest } = await simulateContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amountToApprove],
        chainId,
        gasPrice,
      });
      const tx = await writeContract(wagmiConfig, approveRequest);
      const result: ApproveResult = {
        approvedAmount: amountToApprove,
        tokenAddress,
        allower,
        spender,
      };
      await onApprovePending?.(tx, result);
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: tx,
        chainId,
        pollingInterval,
      });
      return { receipt, result };
    }

    return { receipt: null, result: null };
  } catch (error) {
    throw new TransactionError(
      `Error checking and approving token ${tokenAddress} on chain ${chainId}`,
      {
        chainId,
        tokenAddress,
        spender,
        amount,
        allower,
        errorCode: ERROR_CODES.TRANSACTION.TOKEN_APPROVAL_ERROR,
      }
    );
  }
}
