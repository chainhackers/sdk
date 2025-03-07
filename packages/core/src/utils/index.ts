import type { Address, Hash } from "viem";
import { type ChainId, chainById } from "../data";

export * from "./chains";
export * from "./tokens";
export * from "./bet";
export * from "./format";
export * from "./wallet";

export function bigIntFormatter(_key: string | number, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

export function truncate(fullStr: string, strLen: number, separator = "...") {
  if (fullStr.length <= strLen) return fullStr;

  const frontChars = Math.ceil(strLen / 2);
  const backChars = Math.floor(strLen / 2);

  return fullStr.slice(0, frontChars) + separator + fullStr.slice(fullStr.length - backChars);
}

export function formatAccountUrl(account: Address, chainId: ChainId) {
  const chain = chainById[chainId];
  return `${chain.blockExplorers?.default.url}/address/${account}`;
}

export function formatTxnUrl(tx: Hash, chainId: ChainId) {
  const chain = chainById[chainId];
  return `${chain.blockExplorers?.default.url}/tx/${tx}`;
}
