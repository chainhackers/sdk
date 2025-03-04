import { type TransactionReceipt } from "viem";
import {
  waitRolledBet,
  type CasinoRolledBet,
  type CasinoWaitRollOptions,
} from "./game";
import { type RoulettePlacedBet } from "../../actions/casino/roulette";
import { Roulette, type RouletteNumber } from "../../entities/casino/roulette";
import type { BetSwirlWallet } from "../../provider";

export interface RouletteRolledBet extends CasinoRolledBet {
  rolled: RouletteNumber[];
}

export async function waitRouletteRolledBet(
  wallet: BetSwirlWallet,
  placedBet: RoulettePlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: RouletteRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wallet,
    placedBet,
    options
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(Roulette.decodeRolled),
    },
    receipt,
  };
}
