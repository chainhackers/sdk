import type { Abi, Hex } from "viem";
import type { CASINO_GAME_TYPE, CasinoChainId } from "./data/casino.ts";

export type Token = {
  symbol: string;
  address: Hex;
  decimals: number;
};

export interface CasinoGame {
  game: CASINO_GAME_TYPE;
  label: string;
  gameAddress: Hex;
  bankAddress: Hex;
  abi: Abi;
  paused: boolean;
  chainId: CasinoChainId;
}

export interface HouseEdgeSplit {
  bank: number; // 0 to 10 000 (10 000 = 100%)
  dividend: number; // 0 to 10 000 (10 000 = 100%)
  affiliate: number; // 0 to 10 000 (10 000 = 100%)
  treasury: number; // 0 to 10 000 (10 000 = 100%)
  team: number; // 0 to 10 000 (10 000 = 100%)
}

export interface CasinoToken extends Token {
  paused: boolean;
  balanceRisk: number; // 1 to 10 000 (10 000 = 100%)
  bankrollProvider: Hex; // Owner of the token bankroll
  houseEdgeSplit: HouseEdgeSplit;
  chainId: CasinoChainId;
}

export interface CasinoGameToken extends CasinoToken {
  defaultHouseEdge: number; // 1 to 3500 (3500 = 35%)
  affiliateHouseEdge: number; // 1 to 3500 (3500 = 35%)
  chainlinkVrfSubscriptionId: bigint;
}
