import { type Config as WagmiConfig } from "@wagmi/core";
import {
  getPlacedBetFromReceipt,
  placeBet,
  type CasinoBetParams,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
} from "./game.ts";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino.ts";
import { decodeEventLog, type TransactionReceipt } from "viem";
import { abi as diceAbi } from "../../abis/v2/casino/dice.ts";
import { TransactionError } from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";
import { Dice, type DiceNumber } from "../../entities/casino/dice.ts";
import type { Token } from "../../interfaces.ts";

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
  options?: CasinoPlaceBetOptions
): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
  // Exécution de la transaction
  const { placedBet, receipt } = await placeBet(
    wagmiConfig,
    {
      game: CASINO_GAME_TYPE.DICE,
      gameEncodedExtraParams: [Dice.encodeInput(diceParams.cap)],
      ...diceParams,
    },
    options
  );
  const dicePlacedBet = await getDicePlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    placedBet.chainId,
    placedBet.token
  );
  if (!dicePlacedBet) {
    throw new TransactionError("Dice PlaceBet event not found", {
      errorCode: ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      hash: receipt.transactionHash,
      chainId: placedBet.chainId,
    });
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
