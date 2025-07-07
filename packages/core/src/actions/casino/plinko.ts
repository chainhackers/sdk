import { type TransactionReceipt } from "viem";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import type { WeightedGameConfiguration } from "../../read";
import { type CasinoPlaceBetOptions, type PlaceBetCallbacks } from "./game";
import {
  getWeightedGamePlacedBetFromReceipt,
  placeWeightedGameBet,
  placeWeightedGameFreebet,
  type WeightedGameBetParams,
  type WeightedGameFreebetParams,
  type WeightedGamePlacedBet,
} from "./weightedGame";

export interface PlinkoBetParams extends Omit<WeightedGameBetParams, "game"> {}

export interface PlinkoFreebetParams extends Omit<WeightedGameFreebetParams, "game"> {}

export interface PlinkoPlacedBet extends WeightedGamePlacedBet {}

export async function placePlinkoBet(
  wallet: BetSwirlWallet,
  plinkoParams: PlinkoBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: PlinkoPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameBet(
    wallet,
    {
      ...plinkoParams,
      game: CASINO_GAME_TYPE.PLINKO,
    },
    options,
    callbacks,
  );
}

export async function placePlinkoFreebet(
  wallet: BetSwirlWallet,
  plinkoParams: PlinkoFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedFreebet: PlinkoPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameFreebet(
    wallet,
    {
      ...plinkoParams,
      game: CASINO_GAME_TYPE.PLINKO,
    },
    options,
    callbacks,
  );
}

export async function getPlinkoPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
  customPlinkoConfigs?: WeightedGameConfiguration[],
): Promise<PlinkoPlacedBet | null> {
  return await getWeightedGamePlacedBetFromReceipt(
    wallet,
    receipt,
    chainId,
    CASINO_GAME_TYPE.PLINKO,
    usedToken,
    customPlinkoConfigs,
  );
}
