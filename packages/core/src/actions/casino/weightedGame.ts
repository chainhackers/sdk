import { decodeEventLog, type TransactionReceipt } from "viem";
import { weightedGameAbi } from "../../abis/v2/casino/weightedGame";
import {
  type CasinoChainId,
  labelCasinoGameByType,
  type WEIGHTED_CASINO_GAME_TYPE,
} from "../../data/casino";
import {
  WeightedGame,
  type WeightedGameConfigId,
  type WeightedGameEncodedInput,
} from "../../entities";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import type { WeightedGameConfiguration } from "../../read";
import {
  type CasinoBetParams,
  type CasinoFreebetParams,
  type CasinoPlaceBetOptions,
  getPlacedBetFromReceipt,
  type PlaceBetCallbacks,
  type PlaceFreebetCallbacks,
  placeBet,
  placeFreebet,
  type WeightedCasinoPlacedBet,
} from "./game";

export interface WeightedGameBetParams extends CasinoBetParams {
  weightedGameConfig: WeightedGameConfiguration;
  game: WEIGHTED_CASINO_GAME_TYPE;
}

export interface WeightedGameFreebetParams extends CasinoFreebetParams {
  weightedGameConfig: WeightedGameConfiguration;
  game: WEIGHTED_CASINO_GAME_TYPE;
}

export interface WeightedGamePlacedBet extends WeightedCasinoPlacedBet {
  configId: WeightedGameConfigId;
  configLabel: string;
  encodedConfigId: WeightedGameEncodedInput;
}

export async function placeWeightedGameBet(
  wallet: BetSwirlWallet,
  weightedGameParams: WeightedGameBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: WeightedGamePlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wallet,
    {
      gameEncodedInput: WeightedGame.encodeInput(weightedGameParams.weightedGameConfig.configId),
      ...weightedGameParams,
    },
    options,
    callbacks,
  );
  const weightedGamePlacedBet = await getWeightedGamePlacedBetFromReceipt(
    wallet,
    receipt,
    placedBet.chainId,
    weightedGameParams.game,
    placedBet.token,
  );
  if (!weightedGamePlacedBet) {
    throw new TransactionError(
      `${labelCasinoGameByType[weightedGameParams.game]} PlaceBet event not found`,
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      },
    );
  }
  return { placedBet: weightedGamePlacedBet, receipt };
}

export async function placeWeightedGameFreebet(
  wallet: BetSwirlWallet,
  weightedGameParams: WeightedGameFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: WeightedGamePlacedBet; receipt: TransactionReceipt }> {
  const { placedFreebet, receipt } = await placeFreebet(
    wallet,
    {
      gameEncodedAbiParametersInput: WeightedGame.encodeAbiParametersInput(
        weightedGameParams.weightedGameConfig.configId,
      ),
      ...weightedGameParams,
    },
    options,
    callbacks,
  );
  const weightedGamePlacedFreebet = await getWeightedGamePlacedBetFromReceipt(
    wallet,
    receipt,
    placedFreebet.chainId,
    weightedGameParams.game,
    placedFreebet.token,
  );
  if (!weightedGamePlacedFreebet) {
    throw new TransactionError(
      `${labelCasinoGameByType[weightedGameParams.game]} PlaceBet event not found`,
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedFreebet.chainId,
      },
    );
  }
  return { placedFreebet: weightedGamePlacedFreebet, receipt };
}

export async function getWeightedGamePlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  game: WEIGHTED_CASINO_GAME_TYPE,
  usedToken?: Token,
  customWeightedGameConfigs?: WeightedGameConfiguration[],
): Promise<WeightedGamePlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(wallet, receipt, game, chainId, usedToken);
  if (!gamePlacedBet) {
    return null;
  }

  // Read the Weighted game PlaceBet event from logs
  const decodedWeightedGamePlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: weightedGameAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedWeightedGamePlaceBetEvent) {
    return null;
  }

  const { args } = decodedWeightedGamePlaceBetEvent;
  return {
    ...gamePlacedBet,
    game,
    encodedConfigId: args.configId,
    configId: WeightedGame.decodeInput(args.configId),
    configLabel: WeightedGame.getWeightedGameConfigLabel(
      WeightedGame.decodeInput(args.configId),
      chainId,
      customWeightedGameConfigs,
    ),
  };
}
