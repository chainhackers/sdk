import { type TransactionReceipt } from "viem";
import type { WheelPlacedBet } from "../../actions";
import { Wheel } from "../../entities";
import type { BetSwirlWallet } from "../../provider";
import { type CasinoWaitRollOptions, waitRolledBet } from "./game";
import type { WeightedGameConfiguration, WeightedGameRolledBet } from "./weightedGame";

export interface WheelRolledBet extends WeightedGameRolledBet {}
export async function waitWheelRolledBet(
  wallet: BetSwirlWallet,
  placedBet: WheelPlacedBet,
  weightedGameConfig: WeightedGameConfiguration,
  houseEdge: number,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: WheelRolledBet;
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
        Wheel.decodeRolled(rolledBet, weightedGameConfig, houseEdge),
      ),
    },
    receipt,
  };
}
