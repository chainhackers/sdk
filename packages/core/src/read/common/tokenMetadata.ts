import { encodeFunctionData, erc20Abi, getAddress, zeroAddress, type Address, type Hex } from "viem";
import type { BetSwirlFunctionData, Token } from "../../interfaces";
import { chainNativeCurrencyToToken } from "../../utils/tokens";
import { chainById, type ChainId } from "../../data/chains";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import type { BetSwirlWallet } from "../../provider";

export type RawTokenSymbol = string
export type RawTokenDecimals = number
export async function getTokenMetadata(
  wallet: BetSwirlWallet,
  tokenAddress: Hex,
  chainId: ChainId
): Promise<Token> {
  if (tokenAddress == zeroAddress) {
    return chainNativeCurrencyToToken(chainById[chainId].nativeCurrency);
  }

  try {
    const functionDatas = [
      getTokenDecimalsFunctionData(tokenAddress),
      getTokenSymbolFunctionData(tokenAddress)
    ]
    const tokenMetadata = await wallet.readContracts<typeof functionDatas, [RawTokenDecimals, RawTokenSymbol]>(functionDatas)

    return {
      address: getAddress(tokenAddress),
      decimals: tokenMetadata[0],
      symbol: tokenMetadata[1] || "UNKNOWN",
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

export function getTokenDecimalsFunctionData(
  tokenAddress: Address,
): BetSwirlFunctionData<typeof erc20Abi, "decimals", readonly []> {

  const abi = erc20Abi;
  const functionName = "decimals" as const;
  const args = [] as const;
  return {
    data: { to: tokenAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

export function getTokenSymbolFunctionData(
  tokenAddress: Address,
): BetSwirlFunctionData<typeof erc20Abi, "symbol", readonly []> {

  const abi = erc20Abi;
  const functionName = "symbol" as const;
  const args = [] as const;
  return {
    data: { to: tokenAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
