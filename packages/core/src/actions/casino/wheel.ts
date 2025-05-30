import { type TransactionReceipt } from "viem";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import type { WeightedGameConfiguration } from "../../read";
import { type CasinoPlaceBetOptions, type PlaceBetCallbacks } from "./game";
import {
  type WeightedGameBetParams,
  type WeightedGameFreebetParams,
  type WeightedGamePlacedBet,
  getWeightedGamePlacedBetFromReceipt,
  placeWeightedGameBet,
  placeWeightedGameFreebet,
} from "./weightedGame";

export interface WheelBetParams extends Omit<WeightedGameBetParams, "game"> {}

export interface WheelFreebetParams extends Omit<WeightedGameFreebetParams, "game"> {}

export interface WheelPlacedBet extends WeightedGamePlacedBet {}

export async function placeWheelBet(
  wallet: BetSwirlWallet,
  wheelParams: WheelBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: WheelPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameBet(
    wallet,
    {
      ...wheelParams,
      game: CASINO_GAME_TYPE.WHEEL,
    },
    options,
    callbacks,
  );
}

export async function placeWheelFreebet(
  wallet: BetSwirlWallet,
  wheelParams: WheelFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedFreebet: WheelPlacedBet; receipt: TransactionReceipt }> {
  return await placeWeightedGameFreebet(
    wallet,
    {
      ...wheelParams,
      game: CASINO_GAME_TYPE.WHEEL,
    },
    options,
    callbacks,
  );
}

export async function getWheelPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
  customWheelConfigs?: WeightedGameConfiguration[],
): Promise<WheelPlacedBet | null> {
  return await getWeightedGamePlacedBetFromReceipt(
    wallet,
    receipt,
    chainId,
    CASINO_GAME_TYPE.WHEEL,
    usedToken,
    customWheelConfigs,
  );
}
