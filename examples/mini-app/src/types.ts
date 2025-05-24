import { COINTOSS_FACE } from "@betswirl/sdk-core";

export interface GameResult {
  isWin: boolean;
  payout: bigint;
  currency: string;
  rolled: COINTOSS_FACE;
}

export interface GameResultFormatted extends Omit<GameResult, "payout"> {
  payout: number;
}

export type BetStatus = "pending" | "success" | "error";
