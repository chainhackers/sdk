import type { Hash, Hex } from "viem";
import { encodeFunctionData, erc20Abi, zeroAddress } from "viem";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import type { BetSwirlWallet } from "../../provider";
import type { BetSwirlFunctionData } from "../../interfaces";

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

export type RawAllowance = bigint;

export async function approve(
  wallet: BetSwirlWallet,
  tokenAddress: Hex,
  allower: Hex,
  spender: Hex,
  amount: bigint,
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
      const functionData = getAllowanceFunctionData(tokenAddress, allower, spender);
      allowance = await wallet.readContract<typeof functionData, RawAllowance>(functionData)
    }

    if (!allowance || allowance < amount) {
      const amountToApprove = amount - (allowance || 0n);
      const functionData = getApproveFunctionData(tokenAddress, spender, amountToApprove);
      const tx = await wallet.writeContract(functionData, gasPrice);
      const result: ApproveResult = {
        approvedAmount: amountToApprove,
        tokenAddress,
        allower,
        spender,
      };
      await onApprovePending?.(tx, result);
      const receipt = await wallet.waitTransaction(tx, pollingInterval);
      return { receipt, result };
    }

    return { receipt: null, result: null };
  } catch (error) {
    throw new TransactionError(
      `Error checking and approving token ${tokenAddress} on chain ${wallet.getChainId()}`,
      ERROR_CODES.TRANSACTION.TOKEN_APPROVAL_ERROR,
      {
        chainId: wallet.getChainId(),
        tokenAddress,
        spender,
        amount,
        allower,
      }
    );
  }
}



// multiplier = gross BP_VALUE
export function getAllowanceFunctionData(
  tokenAddress: Hex, allower: Hex, spender: Hex
): BetSwirlFunctionData<typeof erc20Abi, "allowance", readonly [Hex, Hex]> {

  const abi = erc20Abi;
  const functionName = "allowance" as const;
  const args = [allower, spender] as const;
  return {
    data: { to: tokenAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

export function getApproveFunctionData(
  tokenAddress: Hex, spender: Hex, amount: bigint
): BetSwirlFunctionData<typeof erc20Abi, "approve", readonly [Hex, bigint]> {

  const abi = erc20Abi;
  const functionName = "approve" as const;
  const args = [spender, amount] as const;
  return {
    data: { to: tokenAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
