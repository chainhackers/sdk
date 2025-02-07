import { type Config as WagmiConfig } from "@wagmi/core";
import {
  getPlacedBetFromReceipt,
  placeBet,
  type CasinoBetParams,
  type CasinoPlaceBetOptions,
  type CasinoPlacedBet,
} from "./game";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import { decodeEventLog, type TransactionReceipt } from "viem";
import { coinTossAbi } from "../../abis/v2/casino/coinToss";
import { TransactionError } from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import { CoinToss, type COINTOSS_FACE } from "../../entities/casino/coinToss";
import type { Token } from "../../interfaces";

export interface CoinTossParams extends CasinoBetParams {
  face: COINTOSS_FACE;
}

export interface CoinTossPlacedBet extends CasinoPlacedBet {
  face: COINTOSS_FACE;
  encodedFace: boolean;
}

export async function placeCoinTossBet(
  wagmiConfig: WagmiConfig,
  coinTossParams: CoinTossParams,
  options?: CasinoPlaceBetOptions
): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
  // Exécution de la transaction
  const { placedBet, receipt } = await placeBet(
    wagmiConfig,
    {
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedExtraParams: [CoinToss.encodeInput(coinTossParams.face)],
      ...coinTossParams,
    },
    options
  );
  const coinTossPlacedBet = await getCoinTossPlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    placedBet.chainId,
    placedBet.token
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

export async function getCoinTossPlacedBetFromReceipt(
  wagmiConfig: WagmiConfig,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token
): Promise<CoinTossPlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wagmiConfig,
    receipt,
    chainId,
    CASINO_GAME_TYPE.COINTOSS,
    usedToken
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
    face: CoinToss.decodeInput(args.face),
  };
}
