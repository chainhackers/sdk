import { getToken, type Config as WagmiConfig } from "@wagmi/core";
import { zeroAddress, type Hex } from "viem";
import type { Token } from "../../interfaces";
import { chainNativeCurrencyToToken } from "../../utils/tokens";
import { chainById, type ChainId } from "../../data/chains";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
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
      ERROR_CODES.TRANSACTION.TOKEN_METADATA_ERROR,
      {
        chainId,
        tokenAddress,
      }
    );
  }
}
