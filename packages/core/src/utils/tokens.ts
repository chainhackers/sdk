import { zeroAddress, type Address } from "viem";
import type { Token } from "../interfaces";
import { chainById } from "../data";
import type { ChainId } from "../data";

type ChainNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};
export function chainNativeCurrencyToToken(
  nativeCurrency: ChainNativeCurrency
): Token {
  return {
    symbol: nativeCurrency.symbol,
    address: zeroAddress,
    decimals: nativeCurrency.decimals,
  };
}

export function formatTokenUrl(tokenAddress: Address, chainId: ChainId) {
  const chain = chainById[chainId];
  return `${chain.blockExplorers?.default.url}/token/${tokenAddress}`;
}
