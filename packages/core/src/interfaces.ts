import type { Hex } from "viem";

export type Token = {
  symbol: string;
  address: Hex;
  decimals: number;
};
