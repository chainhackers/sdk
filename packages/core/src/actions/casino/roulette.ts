import { decodeEventLog, type TransactionReceipt } from "viem";
import { rouletteAbi } from "../../abis/v2/casino/roulette";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import {
  Roulette,
  type RouletteEncodedInput,
  type RouletteNumber,
} from "../../entities/casino/roulette";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import {
  type CasinoBetParams,
  type CasinoFreebetParams,
  type CasinoPlaceBetOptions,
  getPlacedBetFromReceipt,
  type NormalCasinoPlacedBet,
  type PlaceBetCallbacks,
  type PlaceFreebetCallbacks,
  placeBet,
  placeFreebet,
} from "./game";

export interface RouletteBetParams extends CasinoBetParams {
  numbers: RouletteNumber[];
}

export interface RouletteFreebetParams extends CasinoFreebetParams {
  numbers: RouletteNumber[];
}

export interface RoulettePlacedBet extends NormalCasinoPlacedBet {
  numbers: RouletteNumber[];
  encodedNumbers: RouletteEncodedInput;
  game: CASINO_GAME_TYPE.ROULETTE;
}

export async function placeRouletteBet(
  wallet: BetSwirlWallet,
  rouletteParams: RouletteBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wallet,
    {
      game: CASINO_GAME_TYPE.ROULETTE,
      gameEncodedInput: Roulette.encodeInput(rouletteParams.numbers),
      ...rouletteParams,
    },
    options,
    callbacks,
  );
  const roulettePlacedBet = await getRoulettePlacedBetFromReceipt(
    wallet,
    receipt,
    placedBet.chainId,
    placedBet.token,
  );
  if (!roulettePlacedBet) {
    throw new TransactionError(
      "Roulette PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      },
    );
  }
  return { placedBet: roulettePlacedBet, receipt };
}

export async function placeRouletteFreebet(
  wallet: BetSwirlWallet,
  rouletteParams: RouletteFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: RoulettePlacedBet; receipt: TransactionReceipt }> {
  const { placedFreebet, receipt } = await placeFreebet(
    wallet,
    {
      game: CASINO_GAME_TYPE.ROULETTE,
      gameEncodedAbiParametersInput: Roulette.encodeAbiParametersInput(rouletteParams.numbers),
      ...rouletteParams,
    },
    options,
    callbacks,
  );
  const roulettePlacedFreebet = await getRoulettePlacedBetFromReceipt(
    wallet,
    receipt,
    placedFreebet.chainId,
    placedFreebet.token,
  );
  if (!roulettePlacedFreebet) {
    throw new TransactionError(
      "Roulette PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedFreebet.chainId,
      },
    );
  }
  return { placedFreebet: roulettePlacedFreebet, receipt };
}

export async function getRoulettePlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
): Promise<RoulettePlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wallet,
    receipt,
    CASINO_GAME_TYPE.ROULETTE,
    chainId,
    usedToken,
  );
  if (!gamePlacedBet) {
    return null;
  }

  // Read the Roulette PlaceBet event from logs
  const decodedRoulettePlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: rouletteAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedRoulettePlaceBetEvent) {
    return null;
  }

  const { args } = decodedRoulettePlaceBetEvent;
  return {
    ...gamePlacedBet,
    game: CASINO_GAME_TYPE.ROULETTE,
    encodedNumbers: args.numbers,
    numbers: Roulette.decodeInput(args.numbers),
  };
}
