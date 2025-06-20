import { type Address, zeroAddress } from "viem";
import { GAS_TOKEN_ADDRESS } from "../constants";
import type { CasinoChainId, ChainId } from "../data";
import { casinoChainById, chainById } from "../data";
import type { RawToken, Token } from "../interfaces";

type ChainNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};
export function chainNativeCurrencyToToken(nativeCurrency: ChainNativeCurrency): Token {
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

export function rawTokenToToken(rawToken: RawToken, casinoChainId: CasinoChainId): Token {
  const casinoChain = casinoChainById[casinoChainId];
  return {
    address: rawToken.tokenAddress,
    symbol:
      rawToken.tokenAddress === GAS_TOKEN_ADDRESS
        ? casinoChain.viemChain.nativeCurrency.symbol
        : rawToken.symbol,
    decimals: rawToken.decimals,
  };
}
