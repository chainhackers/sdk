import { decodeEventLog, type TransactionReceipt } from "viem";
import { diceAbi } from "../../abis/v2/casino/dice";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import { Dice, type DiceEncodedInput, type DiceNumber } from "../../entities/casino/dice";
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

export interface DiceBetParams extends CasinoBetParams {
  cap: DiceNumber;
}

export interface DiceFreebetParams extends CasinoFreebetParams {
  cap: DiceNumber;
}

export interface DicePlacedBet extends NormalCasinoPlacedBet {
  cap: DiceNumber;
  encodedCap: DiceEncodedInput;
  game: CASINO_GAME_TYPE.DICE;
}

export async function placeDiceBet(
  wallet: BetSwirlWallet,
  diceParams: DiceBetParams,
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

export async function placeDiceFreebet(
  wallet: BetSwirlWallet,
  diceParams: DiceFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: DicePlacedBet; receipt: TransactionReceipt }> {
  const { placedFreebet, receipt } = await placeFreebet(
    wallet,
    {
      game: CASINO_GAME_TYPE.DICE,
      gameEncodedAbiParametersInput: Dice.encodeAbiParametersInput(diceParams.cap),
      ...diceParams,
    },
    options,
    callbacks,
  );
  const dicePlacedFreebet = await getDicePlacedBetFromReceipt(
    wallet,
    receipt,
    placedFreebet.chainId,
    placedFreebet.token,
  );
  if (!dicePlacedFreebet) {
    throw new TransactionError(
      "Dice PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedFreebet.chainId,
      },
    );
  }
  return { placedFreebet: dicePlacedFreebet, receipt };
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
    game: CASINO_GAME_TYPE.DICE,
    encodedCap: args.cap,
    cap: Dice.decodeInput(args.cap),
  };
}
