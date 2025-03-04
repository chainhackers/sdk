import type { Hash } from "viem";
import { ERROR_CODES, TransactionError } from "../errors";
import type { BetSwirlWallet } from "../provider";


export async function getTransactionReceiptWithRetry(
  wallet: BetSwirlWallet,
  txHash: Hash,
  retries: number[] = [250, 500, 750, 1000, 1250, 1500, 1750, 2000]
) {
  let lastError: Error | undefined;

  for (const delay of retries) {
    try {
      const receipt = wallet.getTransactionReceipt(txHash)
      return receipt;
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new TransactionError(
    "Get transaction recript failfor all retries",
    ERROR_CODES.WALLET.GET_TRANSACTION_RECEIPT_ERROR,
    {
      hash: txHash,
      chainId: wallet.getChainId(),
      retries,
    }
  );
}

