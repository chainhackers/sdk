import { type TransactionReceipt } from "viem";
import type { PlinkoPlacedBet } from "../../actions";
import { Plinko } from "../../entities";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoWaitRollOptions, waitRolledBet } from "./game";
import type { WeightedGameConfiguration, WeightedGameRolledBet } from "./weightedGame";

export interface PlinkoRolledBet extends WeightedGameRolledBet {}
export async function waitPlinkoRolledBet(
  wallet: BetSwirlWallet,
  placedBet: PlinkoPlacedBet,
  weightedGameConfig: WeightedGameConfiguration,
  houseEdge: number,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: PlinkoRolledBet;
  receipt: TransactionReceipt;
}> {
  const { rolledBet, receipt } = await waitRolledBet(
    wallet,
    placedBet,
    options,
    weightedGameConfig,
    houseEdge,
  );
  return {
    rolledBet: {
      ...rolledBet,
      rolled: rolledBet.encodedRolled.map((rolledBet) =>
        Plinko.decodeRolled(rolledBet, weightedGameConfig, houseEdge),
      ),
    },
    receipt,
  };
}
