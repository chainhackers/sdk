import { type Config as WagmiConfig } from "@wagmi/core";
import { type TransactionReceipt } from "viem";
import {
  waitRolledBet,
  type CasinoRolledBet,
  type CasinoWaitRollOptions,
} from "./game.ts";
import { type DicePlacedBet } from "../../actions/casino/dice.ts";
import { Dice, type DiceNumber } from "../../entities/casino/dice.ts";

export interface DiceRolledBet extends CasinoRolledBet {
  rolled: DiceNumber[];
}

export async function waitDiceRolledBet(
  wagmiConfig: WagmiConfig,
  placedBet: DicePlacedBet,
  options?: CasinoWaitRollOptions
): Promise<{
  rolledBet: DiceRolledBet;
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
      rolled: rolledBet.encodedRolled.map(Dice.decodeRolled),
    },
    receipt,
  };
}
