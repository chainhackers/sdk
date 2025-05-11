import { type Hash, type Hex, type TransactionReceipt, encodeFunctionData } from "viem";
import { decodeEventLog } from "viem";
import { coinTossAbi } from "../../abis/v2/casino/cointoss";
import { GAS_TOKEN_ADDRESS } from "../../constants";
import {
  CASINO_GAME_TYPE,
  type CasinoChain,
  type CasinoChainId,
  MAX_SDK_HOUSE_EGDE,
  type NORMAL_CASINO_GAME_TYPE,
  type WEIGHTED_CASINO_GAME_TYPE,
  casinoChainById,
} from "../../data/casino";
import type { KenoEncodedInput } from "../../entities";
import type { CoinTossEncodedInput } from "../../entities/casino/cointoss";
import type { DiceEncodedInput } from "../../entities/casino/dice";
import type { RouletteEncodedInput } from "../../entities/casino/roulette";
import { ERROR_CODES } from "../../errors/codes";
import { ChainError, ConfigurationError, TransactionError } from "../../errors/types";
import type { BetSwirlFunctionData, Token } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getChainlinkVrfCost } from "../../read/common/chainlinkVrfCost";
import { GAS_PRICE_TYPE, getGasPrices } from "../../read/common/gasPrice";
import { getTokenMetadata } from "../../read/common/tokenMetadata";
import { getCasinoChainId } from "../../utils";
import { chainNativeCurrencyToToken } from "../../utils/tokens";
import { ALLOWANCE_TYPE, type ApproveResult, approve } from "../common/approve";

export interface CasinoBetParams {
  betAmount: bigint;
  betCount?: number;
  token?: Token;
  stopGain?: bigint;
  stopLoss?: bigint;
  vrfFees?: bigint;
  receiver?: Hex;
  affiliate?: Hex;
}

export const defaultCasinoGameParams = {
  betCount: 1,
  //token: zeroAddress, => chain.nativeCurrency
  stopGain: 0n,
  stopLoss: 0n,
  vrfFees: 0n, // When 0, VRF fees are calculated on the fly
  //pollingInterval: => data in casino.ts
};

export interface CasinoPlaceBetOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint; // wei
  allowanceType?: ALLOWANCE_TYPE;
  pollingInterval?: number;
}

export const defaultCasinoPlaceBetOptions = {
  gasPriceType: GAS_PRICE_TYPE.NORMAL,
  gasPrice: 0n,
  allowanceType: ALLOWANCE_TYPE.AUTO,
};
// Game should not know the game implementation details, but well..  it helps developers
export type GameEncodedInput =
  | CoinTossEncodedInput
  | DiceEncodedInput
  | RouletteEncodedInput
  | KenoEncodedInput;
export interface GenericCasinoBetParams extends CasinoBetParams {
  game: CASINO_GAME_TYPE;
  gameEncodedInput: GameEncodedInput;
}

interface CommonCasinoPlacedBet {
  id: bigint;
  betAmount: bigint;
  betCount: number;
  totalBetAmount: bigint;
  chargedVRFCost: bigint;
  token: Token;
  affiliate: Hex;
  receiver: Hex;
  stopGain: bigint;
  stopLoss: bigint;
  betTxnHash: Hash;
  betBlock: bigint;
  chainId: CasinoChainId;
}
export interface NormalCasinoPlacedBet extends CommonCasinoPlacedBet {
  game: NORMAL_CASINO_GAME_TYPE;
}
export interface WeightedCasinoPlacedBet extends CommonCasinoPlacedBet {
  game: WEIGHTED_CASINO_GAME_TYPE;
}

export type CasinoPlacedBet = NormalCasinoPlacedBet | WeightedCasinoPlacedBet;

export interface PlaceBetCallbacks {
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>;
  onApproved?: (receipt: TransactionReceipt, result: ApproveResult) => void | Promise<void>;
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>;
}

export async function placeBet(
  wallet: BetSwirlWallet,
  betParams: GenericCasinoBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks,
): Promise<{ placedBet: CasinoPlacedBet; receipt: TransactionReceipt }> {
  const casinoChainId = getCasinoChainId(wallet);
  const casinoChain = casinoChainById[casinoChainId];
  const game = casinoChain.contracts.games[betParams.game];

  if (!game) {
    throw new ChainError(
      `${betParams.game} is not available for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId: casinoChainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  const accountAddress = betParams.receiver || wallet.getAccount(casinoChainId)?.address;
  if (!accountAddress) {
    throw new ConfigurationError(
      `No configured account in the wallet for chain ${casinoChain.viemChain.name} (${casinoChainId})`,
      ERROR_CODES.WALLET.ACCOUNT_MISSING,
      {
        chainId: casinoChainId,
      },
    );
  }
  try {
    // Get gas price if needed
    const gasPrice =
      options?.gasPrice ||
      (await getGasPrices(wallet, casinoChainId))[
        options?.gasPriceType || defaultCasinoPlaceBetOptions.gasPriceType
      ];
    const token =
      betParams.token || chainNativeCurrencyToToken(casinoChain.viemChain.nativeCurrency);

    // Generate function data
    const receiver = betParams.receiver || accountAddress;
    const functionData = getPlaceBetFunctionData(
      { ...betParams, receiver, tokenAddress: token.address },
      casinoChainId,
    );

    // Approve if needed

    const allowanceType = options?.allowanceType || defaultCasinoPlaceBetOptions.allowanceType;
    const pollingInterval = options?.pollingInterval || casinoChain.options.pollingInterval;

    const { receipt: approveReceipt, result: approveResult } = await approve(
      wallet,
      token.address,
      accountAddress,
      game.address,
      functionData.extraData.totalBetAmount,
      gasPrice,
      pollingInterval,
      allowanceType,
      callbacks?.onApprovePending,
    );

    if (approveReceipt) await callbacks?.onApproved?.(approveReceipt, approveResult);

    // Get VRF fees
    const vrfFees =
      betParams.vrfFees ||
      (await getChainlinkVrfCost(
        wallet,
        betParams.game,
        token.address,
        functionData.extraData.betCount,
        gasPrice,
      ));
    // Execute place bet tx
    const hash = await wallet.writeContract(
      functionData,
      functionData.extraData.getValue(vrfFees),
      gasPrice,
    );
    await callbacks?.onBetPlacedPending?.(hash);
    const receipt = await wallet.waitTransaction(hash, pollingInterval);

    const placedBet = await getPlacedBetFromReceipt(wallet, receipt, betParams.game);
    if (!placedBet) {
      throw new TransactionError(
        "PlaceBet event not found",
        ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        {
          gameAddress: game.address,
          gameType: betParams.game,
          chainId: casinoChainId,
          token,
        },
      );
    }

    return { placedBet, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the bet: ${error}`,
      ERROR_CODES.GAME.PLACE_BET_ERROR,
      {
        gameAddress: game.address,
        gameType: betParams.game,
        chainId: casinoChainId,
        token: betParams.token,
        betAmount: betParams.betAmount,
        betCount: betParams.betCount,
        stopGain: betParams.stopGain,
        stopLoss: betParams.stopLoss,
      },
    );
  }
}
type GameAbi<T extends CASINO_GAME_TYPE> = NonNullable<CasinoChain["contracts"]["games"][T]>["abi"];

export function getPlaceBetFunctionData(
  gameParams: Omit<GenericCasinoBetParams, "receiver" | "vrfFees" | "token"> & {
    receiver: Hex;
    tokenAddress?: Hex;
  },
  chainId: CasinoChainId,
): BetSwirlFunctionData<
  GameAbi<typeof gameParams.game>,
  "wager",
  readonly [
    ...GameEncodedInput[],
    Hex,
    Hex,
    {
      readonly token: Hex;
      readonly betAmount: bigint;
      readonly betCount: number;
      readonly stopGain: bigint;
      readonly stopLoss: bigint;
      readonly maxHouseEdge: number;
    },
  ]
> & {
  extraData: {
    totalBetAmount: bigint;
    tokenAddress: Hex;
    betCount: number;
    stopGain: bigint;
    stopLoss: bigint;
    maxHouseEdge: number;
    affiliate: Hex;
    getValue: (vrfFees: bigint) => bigint;
  };
} {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameParams.game];

  if (!game) {
    throw new ChainError(
      `${gameParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      },
    );
  }

  const affiliate = gameParams.affiliate || casinoChain.defaultAffiliate;
  const tokenAddress = gameParams.tokenAddress || GAS_TOKEN_ADDRESS;
  const betCount = gameParams.betCount || defaultCasinoGameParams.betCount;
  const stopGain = gameParams.stopGain || defaultCasinoGameParams.stopGain;
  const stopLoss = gameParams.stopLoss || defaultCasinoGameParams.stopLoss;
  const maxHouseEdge = MAX_SDK_HOUSE_EGDE;

  const abi = game.abi;
  const functionName = "wager" as const;
  const args = [
    ...(Array.isArray(gameParams.gameEncodedInput)
      ? gameParams.gameEncodedInput
      : [gameParams.gameEncodedInput]),
    gameParams.receiver,
    affiliate,
    {
      token: tokenAddress,
      betAmount: gameParams.betAmount,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
    },
  ] as const;

  const totalBetAmount = gameParams.betAmount * BigInt(betCount);
  return {
    data: { to: game.address, abi, functionName, args },
    encodedData: encodeFunctionData({ abi, functionName, args }),
    extraData: {
      totalBetAmount,
      tokenAddress,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
      affiliate,
      getValue: (vrfFees: bigint) =>
        tokenAddress === GAS_TOKEN_ADDRESS ? totalBetAmount + vrfFees : vrfFees,
    },
  };
}

export async function getPlacedBetFromReceipt(
  wallet: BetSwirlWallet,
  receipt: TransactionReceipt,
  game: CASINO_GAME_TYPE,
  chainId?: CasinoChainId,
  usedToken?: Token, // to avoid to fetch the token metadata from the chain if the token used is already known
): Promise<CasinoPlacedBet | null> {
  const casinoChainId = getCasinoChainId(wallet, chainId);
  const casinoChain = casinoChainById[casinoChainId];
  // Read the Placedbet event from logs
  const decodedPlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog<typeof coinTossAbi>({
          //@ts-ignore coinTossAbi is used because PlaceBet event is the same for all games (expect input param)
          abi: casinoChain.contracts.games[game]?.abi!,
          //@ts-ignore
          data: log.data,
          topics: log.topics,
        });
      } catch {
        return null;
      }
    })
    .find((log) => log?.eventName === "PlaceBet");

  if (!decodedPlaceBetEvent) {
    return null;
  }

  const { args } = decodedPlaceBetEvent;

  let token = usedToken;
  if (!token) {
    token = await getTokenMetadata(wallet, args.token!, casinoChainId);
  }
  return {
    id: args.id,
    betAmount: args.amount,
    betCount: args.betCount,
    totalBetAmount: args.amount * BigInt(args.betCount),
    chargedVRFCost: args.chargedVRFCost,
    token,
    affiliate: args.affiliate,
    receiver: args.receiver,
    stopGain: args.stopGain,
    stopLoss: args.stopLoss,
    betTxnHash: receipt.transactionHash,
    betBlock: receipt.blockNumber,
    chainId: casinoChainId,
    game,
  };
}
