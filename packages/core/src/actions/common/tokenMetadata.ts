import { getToken, type Config as WagmiConfig } from "@wagmi/core";
import { zeroAddress, type Hex } from "viem";
import type { Token } from "../../interfaces.ts";
import { chainNativeCurrencyToToken } from "../../utils/tokens.ts";
import { chainById, type ChainId } from "../../data/chains.ts";
import { TransactionError } from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";
export async function getTokenMetadata(
  wagmiConfig: WagmiConfig,
  tokenAddress: Hex,
  chainId: ChainId
): Promise<Token> {
  if (tokenAddress == zeroAddress) {
    return chainNativeCurrencyToToken(chainById[chainId].nativeCurrency);
  }
  try {
    const token = await getToken(wagmiConfig, {
      address: tokenAddress,
      chainId,
    });

    return {
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol || "UNKNOWN",
    };
  } catch (error) {
    throw new TransactionError(
      `Error checking metdata of ${tokenAddress} on chain ${chainId}`,
      {
        chainId,
        tokenAddress,
        errorCode: ERROR_CODES.TRANSACTION.TOKEN_METADATA_ERROR,
      }
    );
  }
}
