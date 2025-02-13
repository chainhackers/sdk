import { type Config as WagmiConfig } from "@wagmi/core";
import {
  getPlacedBetFromReceipt,
  placeBet,
  type CasinoBetParams,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
  type PlaceBetCallbacks,
} from "./game";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import { decodeEventLog, type TransactionReceipt } from "viem";
import { rouletteAbi } from "../../abis/v2/casino/roulette";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import { Roulette, type RouletteNumber } from "../../entities/casino/roulette";
import type { Token } from "../../interfaces";

export interface RouletteParams extends CasinoBetParams {
  numbers: RouletteNumber[];
}

export interface RoulettePlacedBet extends CasinoPlacedBet {
  numbers: RouletteNumber[];
  encodedNumbers: number;
}

export async function placeRouletteBet(
  wagmiConfig: WagmiConfig,
  rouletteParams: RouletteParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks
): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wagmiConfig,
    {
      game: CASINO_GAME_TYPE.ROULETTE,
      gameEncodedExtraParams: [Roulette.encodeInput(rouletteParams.numbers)],
      ...rouletteParams,
    },
    options,
    callbacks
  );
  const roulettePlacedBet = await getRoulettePlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    placedBet.chainId,
    placedBet.token
  );
  if (!roulettePlacedBet) {
    throw new TransactionError(
      "Roulette PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      }
    );
  }
  return { placedBet: roulettePlacedBet, receipt };
}

export async function getRoulettePlacedBetFromReceipt(
  wagmiConfig: WagmiConfig,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token
): Promise<RoulettePlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    chainId,
    CASINO_GAME_TYPE.ROULETTE,
    usedToken
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
    encodedNumbers: args.numbers,
    numbers: Roulette.decodeInput(args.numbers),
  };
}
