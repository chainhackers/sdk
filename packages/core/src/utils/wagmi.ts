import { getTransactionReceipt, type Config as WagmiConfig } from "@wagmi/core";
import type { Account, Hash } from "viem";
import { ERROR_CODES, TransactionError } from "../errors";

// Wagmi currently does not support hoisting Private Key & Mnemonic Accounts to the top-level Wagmi Config – meaning we have to explicitly pass through the account to every Action
// If at least one connector exists, then do not return an account
export function getAccountFromWagmiConfig(
  wagmiConfig: WagmiConfig,
  chainId?: number
): Account | undefined {
  if (wagmiConfig.connectors.length > 0) return undefined;
  else return wagmiConfig.getClient({ chainId }).account;
}
export async function getTransactionReceiptWithRetry(
  wagmiConfig: WagmiConfig,
  txHash: Hash,
  chainId?: number,
  retries: number[] = [250, 500, 750, 1000, 1250, 1500, 1750, 2000]
) {
  let lastError: Error | undefined;

  for (const delay of retries) {
    try {
      const receipt = await getTransactionReceipt(wagmiConfig, {
        hash: txHash,
        chainId: chainId,
      });
      return receipt;
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new TransactionError(
    "Get transaction recript failfor all retries",
    ERROR_CODES.WAGMI.GET_TRANSACTION_RECEIPT_ERROR,
    {
      hash: txHash,
      chainId: chainId,
      retries,
    }
  );
}
