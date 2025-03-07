import { type TransactionReceipt } from "viem";
import { type DicePlacedBet } from "../../actions/casino/dice";
import { Dice, type DiceNumber } from "../../entities/casino/dice";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoRolledBet, type CasinoWaitRollOptions, waitRolledBet } from "./game";

export interface DiceRolledBet extends CasinoRolledBet {
  rolled: DiceNumber[];
}

export async function waitDiceRolledBet(
  wallet: BetSwirlWallet,
  placedBet: DicePlacedBet,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: DiceRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(wallet, placedBet, options);
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map(Dice.decodeRolled),
    },
    receipt,
  };
}
