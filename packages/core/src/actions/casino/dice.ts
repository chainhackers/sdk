import { type TransactionReceipt, decodeEventLog } from "viem";
import { diceAbi } from "../../abis/v2/casino/dice";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import { Dice, type DiceEncodedInput, type DiceNumber } from "../../entities/casino/dice";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import {
  type CasinoBetParams,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
  type PlaceBetCallbacks,
  getPlacedBetFromReceipt,
  placeBet,
} from "./game";

export interface DiceParams extends CasinoBetParams {
  cap: DiceNumber;
}

export interface DicePlacedBet extends CasinoPlacedBet {
  cap: DiceNumber;
  encodedCap: DiceEncodedInput;
}

export async function placeDiceBet(
  wallet: BetSwirlWallet,
  diceParams: DiceParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wallet,
    {
      game: CASINO_GAME_TYPE.DICE,
      gameEncodedInput: Dice.encodeInput(diceParams.cap),
      ...diceParams,
    },
    options,
    callbacks,
  );
  const dicePlacedBet = await getDicePlacedBetFromReceipt(
    wallet,
    receipt,
    placedBet.chainId,
    placedBet.token,
  );
  if (!dicePlacedBet) {
    throw new TransactionError(
      "Dice PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      },
    );
  }

  return { placedBet: dicePlacedBet, receipt };
}

export async function getDicePlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
): Promise<DicePlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wallet,
    receipt,
    CASINO_GAME_TYPE.DICE,
    chainId,
    usedToken,
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
