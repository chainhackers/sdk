import type { Abi, Address, Hash, Hex } from "viem";
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

// Subgraph types
export interface CasinoBet {
  id: bigint;
  token: Token;
  nativeCurrency: Token;
  chainId: CasinoChainId;
  game: CASINO_GAME_TYPE;
  gameAddress: Address;
  bettor: Address;
  betAmount: bigint;
  formattedBetAmount: number;
  totalBetAmount: bigint;
  formattedTotalBetAmount: number;
  betCount: number;
  stopLoss: bigint;
  formattedStopLoss: number;
  stopGain: bigint;
  formattedStopGain: number;
  houseEdge: number; // BP
  betTimestamp: number; // secs
  chargedVRFFees: bigint;
  formattedChargedVRFFees: number;
  betTxnHash: Hash;
  encodedInput: string;
  decodedInput: any;
  payout?: bigint;
  formattedPayout?: number;
  payoutMultiplier?: number;
  benefit?: bigint;
  formattedBenefit?: number;
  rollTxnHash?: Hash;
  rollTimestamp?: number; // secs
  isResolved: boolean;
  isRefunded: boolean;
  rollTotalBetAmount?: bigint;
  fomattedRollTotalBetAmount?: number;
  rollBetCount?: number;
  encodedRolled?: Array<string>;
  decodedRolled?: Array<any>;
  affiliate?: Address;
  isWin?: boolean;
  isLost?: boolean;
  isStopLossTriggered?: boolean;
  isStopGainTriggered?: boolean;
}
