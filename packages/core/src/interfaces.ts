import type { Abi, Address, ContractEventName, ContractFunctionName, Hash, Hex, Log } from "viem";
import type { CASINO_GAME_TYPE, CasinoChainId } from "./data/casino";

export interface BetSwirlFunctionData<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi>,
  TArgs extends readonly any[],
> {
  data: {
    to: Address;
    abi: TAbi;
    functionName: TFunctionName;
    args: TArgs;
  };
  encodedData: Hex;
}
export interface BetSwirlEventData<
  TAbi extends Abi,
  TEventName extends ContractEventName<TAbi>,
  TArgs extends Record<string, any>,
> {
  data: {
    to: Address;
    abi: TAbi;
    eventName: TEventName;
    args: TArgs;
    pollingInterval: number;
  };
  callbacks: {
    onLogs?: (logs: Log[]) => Promise<void> | void;
    onError?: (error: Error) => Promise<void> | void;
  };
}

export type RawToken = {
  symbol: string;
  tokenAddress: Hex;
  decimals: number;
};

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
  isAllowed: boolean;
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
  formattedBetAmount: string;
  totalBetAmount: bigint;
  formattedTotalBetAmount: string;
  betCount: number;
  stopLoss: bigint;
  formattedStopLoss: string;
  stopGain: bigint;
  formattedStopGain: string;
  houseEdge: number; // BP
  betTimestampSecs: number; // secs
  betDate: Date;
  chargedVRFFees: bigint;
  formattedChargedVRFFees: string;
  betTxnHash: Hash;
  encodedInput: string;
  decodedInput: any;
  payout?: bigint;
  formattedPayout?: string;
  payoutMultiplier?: number;
  benefit?: bigint;
  formattedBenefit?: string;
  rollTxnHash?: Hash;
  rollTimestampSecs?: number;
  rollDate?: Date;
  isResolved: boolean;
  isRefunded: boolean;
  rollTotalBetAmount?: bigint;
  fomattedRollTotalBetAmount?: string;
  rollBetCount?: number;
  encodedRolled?: Array<string>;
  decodedRolled?: Array<any>;
  affiliate?: Address;
  isWin?: boolean;
  isLost?: boolean;
  isStopLossTriggered?: boolean;
  isStopGainTriggered?: boolean;
}

export interface SubgraphToken {
  id: Address;
  address: Address;
  chainId: CasinoChainId;
  symbol: string;
  name: string;
  decimals: number;
  betTxnCount: number;
  betCount: number;
  winTxnCount: number;
  userCount: number;
  totalWagered: bigint;
  formattedTotalWagered: string;
  totalPayout: bigint;
  formattedTotalPayout: string;
  dividendAmount: bigint;
  formattedDividendAmount: string;
  bankAmount: bigint;
  formattedBankAmount: string;
  affiliateAmount: bigint;
  formattedAffiliateAmount: string;
  treasuryAmount: bigint;
  formattedTreasuryAmount: string;
  teamAmount: bigint;
  formattedTeamAmount: string;
}
