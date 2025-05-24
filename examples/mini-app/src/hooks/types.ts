import type { CASINO_GAME_TYPE, COINTOSS_FACE } from "@betswirl/sdk-core";
import type { Abi, Hex } from "viem";

export interface GameResult {
  isWin: boolean;
  payout: bigint;
  currency: string;
  rolled: COINTOSS_FACE;
}

export interface WatchTarget {
  betId: bigint;
  contractAddress: Hex;
  gameType: CASINO_GAME_TYPE;
  eventAbi: Abi;
  eventName: string;
  eventArgs: { id: bigint };
}
