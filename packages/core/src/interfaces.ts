import type { Abi, Hex } from "viem";
import type { CASINO_GAME_TYPE, CasinoChainId } from "./data/casino";

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
  bankPercent: number;
  dividend: number; // 0 to 10 000 (10 000 = 100%)
  dividendPercent: number;
  affiliate: number; // 0 to 10 000 (10 000 = 100%)
  affiliatePercent: number;
  treasury: number; // 0 to 10 000 (10 000 = 100%)
  treasuryPercent: number;
  team: number; // 0 to 10 000 (10 000 = 100%)
  teamPercent: number;
}

export interface CasinoToken extends Token {
  paused: boolean;
  balanceRisk: number; // 1 to 10 000
  balanceRiskPercent: number;
  bankrollProvider: Hex; // Owner of the token bankroll
  houseEdgeSplit: HouseEdgeSplit;
  chainId: CasinoChainId;
}

export interface CasinoGameToken extends CasinoToken {
  game: CASINO_GAME_TYPE;
  defaultHouseEdge: number; // 1 to 3500 (3500 = 35%)
  defaultHouseEdgePercent: number;
  affiliateHouseEdge: number; // 1 to 3500 (3500 = 35%)
  affiliateHouseEdgePercent: number;
  chainlinkVrfSubscriptionId: bigint;
}

export interface BetRequirements {
  token: Token;
  multiplier: number;
  maxBetAmount: bigint;
  maxBetCount: number;
  chainId: CasinoChainId;
}
