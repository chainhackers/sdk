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
import { diceAbi } from "../../abis/v2/casino/dice";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import { Dice, type DiceNumber } from "../../entities/casino/dice";
import type { Token } from "../../interfaces";

export interface DiceParams extends CasinoBetParams {
  cap: DiceNumber;
}

export interface DicePlacedBet extends CasinoPlacedBet {
  cap: DiceNumber;
  encodedCap: number;
}

export async function placeDiceBet(
  wagmiConfig: WagmiConfig,
  diceParams: DiceParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks
): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wagmiConfig,
    {
      game: CASINO_GAME_TYPE.DICE,
      gameEncodedInput: Dice.encodeInput(diceParams.cap),
      ...diceParams,
    },
    options,
    callbacks
  );
  const dicePlacedBet = await getDicePlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    placedBet.chainId,
    placedBet.token
  );
  if (!dicePlacedBet) {
    throw new TransactionError(
      "Dice PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      }
    );
  }

  return { placedBet: dicePlacedBet, receipt };
}

export async function getDicePlacedBetFromReceipt(
  wagmiConfig: WagmiConfig,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token
): Promise<DicePlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    chainId,
    CASINO_GAME_TYPE.DICE,
    usedToken
  );
  if (!gamePlacedBet) {
    return null;
  }
  // Read the Dice PlaceBet event from logs
  const decodedDicePlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: diceAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedDicePlaceBetEvent) {
    return null;
  }

  const { args } = decodedDicePlaceBetEvent;
  return {
    ...gamePlacedBet,
    encodedCap: args.cap,
    cap: Dice.decodeInput(args.cap),
  };
}
