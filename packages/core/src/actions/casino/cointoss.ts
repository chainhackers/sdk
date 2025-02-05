import { type Config as WagmiConfig } from "@wagmi/core";
import {
  getPlacedBetFromReceipt,
  placeBet,
  type CasinoBetInputs,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
} from "./game.ts";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino.ts";
import { decodeEventLog, type TransactionReceipt } from "viem";
import { abi as coinTossAbi } from "../../abis/v2/casino/coinToss.ts";
import { TransactionError } from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";

export enum COINTOSS_FACE {
  TAILS = 1,
  HEADS = 0,
}
export interface CoinTossInputs extends CasinoBetInputs {
  face: COINTOSS_FACE;
}

export interface CoinTossPlacedBet extends CasinoPlacedBet {
  face: COINTOSS_FACE;
  encodedFace: boolean;
}

export function encodeCoinTossInput(face: COINTOSS_FACE): boolean {
  return Boolean(face);
}

export function decodeCoinTossInput(encodedFace: boolean): COINTOSS_FACE {
  return encodedFace ? COINTOSS_FACE.HEADS : COINTOSS_FACE.TAILS;
}

export async function placeCoinTossBet(
  wagmiConfig: WagmiConfig,
  coinTossInputs: CoinTossInputs,
  options?: CasinoPlaceBetOptions
): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
  const face = Boolean(coinTossInputs.face);
  // Exécution de la transaction
  const { placedBet, receipt } = await placeBet(
    wagmiConfig,
    {
      game: CASINO_GAME_TYPE.COINTOSS,
      encodedInputs: [face],
      ...coinTossInputs,
    },
    options
  );
  const coinTossPlacedBet = getCoinTossPlacedBetFromReceipt(
    receipt,
    placedBet.chainId
  );
  if (!coinTossPlacedBet) {
    throw new TransactionError("CoinToss PlaceBet event not found", {
      errorCode: ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      hash: receipt.transactionHash,
      chainId: placedBet.chainId,
    });
  }
  return { placedBet: coinTossPlacedBet, receipt };
}

export function getCoinTossPlacedBetFromReceipt(
  receipt: TransactionReceipt,
  chainId: CasinoChainId
): CoinTossPlacedBet | null {
  const gamePlacedBet = getPlacedBetFromReceipt(
    receipt,
    chainId,
    CASINO_GAME_TYPE.COINTOSS
  );
  if (!gamePlacedBet) {
    return null;
  }
  // Read the CoinToss PlaceBet event from logs
  const decodedCoinTossPlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: coinTossAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedCoinTossPlaceBetEvent) {
    return null;
  }

  const { args } = decodedCoinTossPlaceBetEvent;
  return {
    ...gamePlacedBet,
    encodedFace: args.face,
    face: decodeCoinTossInput(args.face),
  };
}
