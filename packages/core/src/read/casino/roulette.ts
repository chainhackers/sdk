import { type Config as WagmiConfig } from "@wagmi/core";
import { type TransactionReceipt } from "viem";
import {
  waitRolledBet,
  type CasinoRolledBet,
  type CasinoWaitRollOptions,
} from "./game";
import { type RoulettePlacedBet } from "../../actions/casino/roulette";
import { Roulette, type RouletteNumber } from "../../entities/casino/roulette";

export interface RouletteRolledBet extends CasinoRolledBet {
  rolled: RouletteNumber[];
}

export async function waitRouletteRolledBet(
  wagmiConfig: WagmiConfig,
  placedBet: RoulettePlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: RouletteRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wagmiConfig,
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
