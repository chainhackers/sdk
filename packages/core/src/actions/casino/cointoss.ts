import { decodeEventLog, type TransactionReceipt } from "viem";
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
  type CasinoFreebetParams,
  type CasinoPlaceBetOptions,
  getPlacedBetFromReceipt,
  type NormalCasinoPlacedBet,
  type PlaceBetCallbacks,
  type PlaceFreebetCallbacks,
  placeBet,
  placeFreebet,
} from "./game";

export interface CoinTossBetParams extends CasinoBetParams {
  face: COINTOSS_FACE;
}

export interface CoinTossFreebetParams extends CasinoFreebetParams {
  face: COINTOSS_FACE;
}

export interface CoinTossPlacedBet extends NormalCasinoPlacedBet {
  face: COINTOSS_FACE;
  encodedFace: CoinTossEncodedInput;
  game: CASINO_GAME_TYPE.COINTOSS;
}

export async function placeCoinTossBet(
  wallet: BetSwirlWallet,
  coinTossParams: CoinTossBetParams,
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

export async function placeCoinTossFreebet(
  wallet: BetSwirlWallet,
  coinTossParams: CoinTossFreebetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceFreebetCallbacks,
): Promise<{ placedFreebet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
  const { placedFreebet, receipt } = await placeFreebet(
    wallet,
    {
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedAbiParametersInput: CoinToss.encodeAbiParametersInput(coinTossParams.face),
      ...coinTossParams,
    },
    options,
    callbacks,
  );
  const coinTossPlacedFreebet = await getCoinTossPlacedBetFromReceipt(
    wallet,
    receipt,
    placedFreebet.chainId,
    placedFreebet.token,
  );
  if (!coinTossPlacedFreebet) {
    throw new TransactionError(
      "CoinToss PlaceBet event not found",
      ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
      {
        hash: receipt.transactionHash,
        chainId: placedFreebet.chainId,
      },
    );
  }
  return { placedFreebet: coinTossPlacedFreebet, receipt };
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
