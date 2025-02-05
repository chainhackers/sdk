import {
  encodeFunctionData,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";
import {
  CASINO_GAME_TYPE,
  casinoChainById,
  casinoChainByKey,
  MAX_SDK_HOUSE_EGDE,
  type CasinoChainId,
} from "../../data/casino.ts";
import {
  type Config as WagmiConfig,
  writeContract,
  simulateContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  ChainError,
  ConfigurationError,
  TransactionError,
} from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";
import {
  ALLOWANCE_TYPE,
  approve,
  type ApproveResult,
} from "../common/approve.ts";
import { GAS_PRICE_TYPE, getGasPrices } from "../../read/gasPrice.ts";
import { getChainlinkVrfCost } from "../../read/chainlinkVrfCost.ts";
import { decodeEventLog } from "viem";
import { abi as coinTossAbi } from "../../abis/v2/casino/coinToss.ts";
import type { Token } from "../../interfaces.ts";
import { chainNativeCurrencyToToken } from "../../utils/tokens.ts";
import { getTokenMetadata } from "../common/tokenMetadata.ts";

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
  //pollInterval: => data in casino.ts
};

export interface CasinoPlaceBetOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint; // wei
  chainId?: CasinoChainId;
  allowanceType?: ALLOWANCE_TYPE;
  pollInterval?: number;
}

export const defaultCasinoPlaceBetOptions = {
  gasPriceType: GAS_PRICE_TYPE.NORMAL,
  gasPrice: 0n,
  chainId: casinoChainByKey.avalanche.id,
  allowanceType: ALLOWANCE_TYPE.AUTO,
};

export interface GenericCasinoBetParams extends CasinoBetParams {
  game: CASINO_GAME_TYPE;
  gameEncodedExtraParams: any[]; // CasinoGameParams excluded
}

export interface CasinoPlacedBet {
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
  placeBetHash: Hash;
  placeBetBlock: bigint;
  chainId: CasinoChainId;
  game: CASINO_GAME_TYPE;
}

export async function placeBet(
  wagmiConfig: WagmiConfig,
  betParams: GenericCasinoBetParams,
  options?: CasinoPlaceBetOptions,
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>,
  onApproved?: (
    receipt: TransactionReceipt,
    result: ApproveResult
  ) => void | Promise<void>,
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>
): Promise<{ placedBet: CasinoPlacedBet; receipt: TransactionReceipt }> {
  const chainId = options?.chainId || defaultCasinoPlaceBetOptions.chainId;
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[betParams.game];

  if (!game) {
    throw new ChainError(
      `${betParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
        errorCode: ERROR_CODES.CHAIN.GAME_NOT_AVAILABLE,
      }
    );
  }

  const accountAddress =
    betParams.receiver || wagmiConfig.getClient({ chainId }).account?.address;
  if (!accountAddress) {
    throw new ConfigurationError(
      `No configured account in wagmi config for chain ${casinoChain.viemChain.name} (${chainId})`,
      {
        chainId,
        errorCode: ERROR_CODES.WAGMI.ACCOUNT_MISSING,
      }
    );
  }
  try {
    // Get gas price if needed
    const gasPrice =
      options?.gasPrice ||
      (await getGasPrices(wagmiConfig, chainId))[
        options?.gasPriceType || defaultCasinoPlaceBetOptions.gasPriceType
      ];

    // Generate function data
    const receiver = betParams.receiver || accountAddress;
    const functionData = generatePlayGameFunctionData(
      { ...betParams, receiver },
      chainId
    );

    // Approve if needed
    const token =
      betParams.token ||
      chainNativeCurrencyToToken(casinoChain.viemChain.nativeCurrency);
    const allowanceType =
      options?.allowanceType || defaultCasinoPlaceBetOptions.allowanceType;
    const pollingInterval =
      options?.pollInterval || casinoChain.options.pollingInterval;
    const { receipt: approveReceipt, result: approveResult } = await approve(
      wagmiConfig,
      token.address,
      accountAddress,
      game.address,
      functionData.totalBetAmount,
      chainId,
      gasPrice,
      pollingInterval,
      allowanceType,
      onApprovePending
    );

    if (approveReceipt) await onApproved?.(approveReceipt, approveResult);

    // Get VRF fees
    const vrfFees =
      betParams.vrfFees ||
      (await getChainlinkVrfCost(
        wagmiConfig,
        game.address,
        token.address,
        functionData.betCount,
        chainId,
        gasPrice
      ));
    // Simulate place bet tx
    const { request } = await simulateContract(wagmiConfig, {
      address: game.address,
      value: vrfFees,
      args: functionData.data.args,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      chainId: chainId,
      gasPrice: gasPrice,
    });

    // Execute place bet tx
    const hash = await writeContract(wagmiConfig, request);
    await onBetPlacedPending?.(hash);
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId,
      pollingInterval,
    });

    const placedBet = await getPlacedBetFromReceipt(
      wagmiConfig,
      receipt,
      chainId,
      betParams.game
    );
    if (!placedBet) {
      throw new TransactionError("PlaceBet event not found", {
        errorCode: ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        gameAddress: game.address,
        gameType: betParams.game,
        chainId,
        token,
      });
    }

    return { placedBet, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the bet: ${error}`,
      {
        errorCode: ERROR_CODES.GAME.PLACE_BET_ERROR,
        gameAddress: game.address,
        gameType: betParams.game,
        chainId,
        token: betParams.token,
        betAmount: betParams.betAmount,
        betCount: betParams.betCount,
        stopGain: betParams.stopGain,
        stopLoss: betParams.stopLoss,
      }
    );
  }
}

export function generatePlayGameFunctionData(
  gameParams: Omit<GenericCasinoBetParams, "receiver" | "vrfFees"> & {
    receiver: Hex;
  },
  chainId: CasinoChainId = defaultCasinoPlaceBetOptions.chainId
) {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameParams.game];

  if (!game) {
    throw new ChainError(
      `${gameParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
        errorCode: ERROR_CODES.CHAIN.GAME_NOT_AVAILABLE,
      }
    );
  }

  const affiliate = gameParams.affiliate || casinoChain.defaultAffiliate;
  const token =
    gameParams.token ||
    chainNativeCurrencyToToken(casinoChain.viemChain.nativeCurrency);
  const betCount = gameParams.betCount || defaultCasinoGameParams.betCount;
  const stopGain = gameParams.stopGain || defaultCasinoGameParams.stopGain;
  const stopLoss = gameParams.stopLoss || defaultCasinoGameParams.stopLoss;
  const maxHouseEdge = MAX_SDK_HOUSE_EGDE;

  const data = {
    abi: game.abi,
    functionName: "wager",
    args: [
      ...gameParams.gameEncodedExtraParams,
      gameParams.receiver,
      affiliate,
      {
        token: token.address,
        betAmount: gameParams.betAmount,
        betCount,
        stopGain,
        stopLoss,
        maxHouseEdge,
      },
    ],
  };

  return {
    data,
    encodedData: encodeFunctionData(data),
    totalBetAmount: gameParams.betAmount * BigInt(betCount),
    token,
    betCount,
    stopGain,
    stopLoss,
    maxHouseEdge,
    affiliate,
  };
}

export async function getPlacedBetFromReceipt(
  wagmiConfig: WagmiConfig,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  game: CASINO_GAME_TYPE,
  usedToken?: Token // to avoid to fetch the token metadata from the chain if the token used is already known
): Promise<CasinoPlacedBet | null> {
  // Read the Placedbet event from logs
  const decodedPlaceBetEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: coinTossAbi, // coinTossAbi is used because PlaceBet event is the same for all games (expect input param)
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
    token = await getTokenMetadata(wagmiConfig, args.token!, chainId);
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
    placeBetHash: receipt.transactionHash,
    placeBetBlock: receipt.blockNumber,
    chainId,
    game,
  };
}
