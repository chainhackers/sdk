import { decodeEventLog, type TransactionReceipt } from "viem";
import { kenoAbi } from "../../abis/v2/casino/keno";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import { Keno, type KenoBall, type KenoEncodedInput } from "../../entities/casino/keno";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import type { KenoConfiguration } from "../../read";
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

export interface KenoBetParams extends CasinoBetParams {
  balls: KenoBall[];
  kenoConfig: KenoConfiguration;
}

export interface KenoFreebetParams extends CasinoFreebetParams {
  balls: KenoBall[];
  kenoConfig: KenoConfiguration;
}

export interface KenoPlacedBet extends NormalCasinoPlacedBet {
  balls: KenoBall[];
  encodedBalls: KenoEncodedInput;
  game: CASINO_GAME_TYPE.KENO;
}

export async function placeKenoBet(
  wallet: BetSwirlWallet,
  kenoParams: KenoBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wallet,
    {
      game: CASINO_GAME_TYPE.KENO,
      gameEncodedInput: Keno.encodeInput(kenoParams.balls, kenoParams.kenoConfig),
      ...kenoParams,
    },
    options,
    callbacks,
  );
  const kenoPlacedBet = await getKenoPlacedBetFromReceipt(
    wallet,
    receipt,
    placedBet.chainId,
    placedBet.token,
  );
  if (!kenoPlacedBet) {
    throw new TransactionError(
      "Keno PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      },
    );
  }
  return { placedBet: kenoPlacedBet, receipt };
}

export async function placeKenoFreebet(
  wallet: BetSwirlWallet,
  kenoParams: KenoFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: KenoPlacedBet; receipt: TransactionReceipt }> {
  const { placedFreebet, receipt } = await placeFreebet(
    wallet,
    {
      game: CASINO_GAME_TYPE.KENO,
      gameEncodedAbiParametersInput: Keno.encodeAbiParametersInput(
        kenoParams.balls,
        kenoParams.kenoConfig,
      ),
      ...kenoParams,
    },
    options,
    callbacks,
  );
  const kenoPlacedFreebet = await getKenoPlacedBetFromReceipt(
    wallet,
    receipt,
    placedFreebet.chainId,
    placedFreebet.token,
  );
  if (!kenoPlacedFreebet) {
    throw new TransactionError(
      "Keno PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedFreebet.chainId,
      },
    );
  }
  return { placedFreebet: kenoPlacedFreebet, receipt };
}

export async function getKenoPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
): Promise<KenoPlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wallet,
    receipt,
    CASINO_GAME_TYPE.KENO,
    chainId,
    usedToken,
  );
  if (!gamePlacedBet) {
    return null;
  }

  // Read the Keno PlaceBet event from logs
  const decodedKenoPlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: kenoAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedKenoPlaceBetEvent) {
    return null;
  }

  const { args } = decodedKenoPlaceBetEvent;
  return {
    ...gamePlacedBet,
    game: CASINO_GAME_TYPE.KENO,
    encodedBalls: args.numbers,
    balls: Keno.decodeInput(args.numbers),
  };
}
