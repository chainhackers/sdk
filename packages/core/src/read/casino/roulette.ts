import { type TransactionReceipt } from "viem";
import { type RoulettePlacedBet } from "../../actions/casino/roulette";
import { Roulette, type RouletteNumber } from "../../entities/casino/roulette";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoRolledBet, type CasinoWaitRollOptions, waitRolledBet } from "./game";

export interface RouletteRolledBet extends Omit<CasinoRolledBet, "decodedRoll"> {
  rolled: RouletteNumber[];
}

export async function waitRouletteRolledBet(
  wallet: BetSwirlWallet,
  placedBet: RoulettePlacedBet,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: RouletteRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(wallet, placedBet, options);
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(Roulette.decodeRolled),
    },
    receipt,
  };
}
