import { type TransactionReceipt, decodeEventLog } from "viem";
import { coinTossAbi } from "../../abis/v2/casino/cointoss";
import { CASINO_GAME_TYPE, type CasinoChainId } from "../../data/casino";
import {
  type COINTOSS_FACE,
  CoinToss,
  type CoinTossEncodedInput,
} from "../../entities/casino/cointoss";
import { ERROR_CODES } from "../../errors/codes";
import { TransactionError } from "../../errors/types";
import type { Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import {
  type CasinoBetParams,
  type CasinoPlaceBetOptions,
  type NormalCasinoPlacedBet,
  type PlaceBetCallbacks,
  getPlacedBetFromReceipt,
  placeBet,
} from "./game";

export interface CoinTossParams extends CasinoBetParams {
  face: COINTOSS_FACE;
}

export interface CoinTossPlacedBet extends NormalCasinoPlacedBet {
  face: COINTOSS_FACE;
  encodedFace: CoinTossEncodedInput;
  game: CASINO_GAME_TYPE.COINTOSS;
}

export async function placeCoinTossBet(
  wallet: BetSwirlWallet,
  coinTossParams: CoinTossParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
  const { placedBet, receipt } = await placeBet(
    wallet,
    {
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedInput: CoinToss.encodeInput(coinTossParams.face),
      ...coinTossParams,
    },
    options,
    callbacks,
  );
  const coinTossPlacedBet = await getCoinTossPlacedBetFromReceipt(
    wallet,
    receipt,
    placedBet.chainId,
    placedBet.token,
  );
  if (!coinTossPlacedBet) {
    throw new TransactionError(
      "CoinToss PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedBet.chainId,
      },
    );
  }
  return { placedBet: coinTossPlacedBet, receipt };
}

export async function getCoinTossPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  usedToken?: Token,
): Promise<CoinTossPlacedBet | null> {
  const gamePlacedBet = await getPlacedBetFromReceipt(
    wallet,
    receipt,
    CASINO_GAME_TYPE.COINTOSS,
    chainId,
    usedToken,
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
    game: CASINO_GAME_TYPE.COINTOSS,
    encodedFace: args.face,
    face: CoinToss.decodeInput(args.face),
  };
}
