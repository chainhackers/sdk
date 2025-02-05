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
import { abi as coinTossAbi } from "../../abis/v2/casino/coinToss.ts";
import { TransactionError } from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";
import {
  CoinToss,
  type COINTOSS_FACE,
} from "../../entities/casino/coinToss.ts";

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
// TODO I think its is not useful because encodedFace & face are getatble in placeCoinTossBet
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
    face: CoinToss.decodeInput(args.face),
  };
}
