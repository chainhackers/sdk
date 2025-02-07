import { zeroAddress } from "viem";
import type { Token } from "../interfaces";

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
