import {
  encodeFunctionData,
  zeroAddress,
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

export interface CasinoBetInputs {
  betAmount: bigint;
  betCount?: number;
  tokenAddress?: Hex;
  stopGain?: bigint;
  stopLoss?: bigint;
  vrfFees?: bigint;
  receiver?: Hex;
  affiliate?: Hex;
}

export const defaultCasinoGameInputs = {
  betCount: 1,
  tokenAddress: zeroAddress,
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

export interface GenericCasinoBetInputs extends CasinoBetInputs {
  game: CASINO_GAME_TYPE;
  encodedInputs: any[]; // CasinoGameInputs excluded
}

export interface CasinoPlacedBet {
  id: bigint;
  betAmount: bigint;
  betCount: number;
  totalBetAmount: bigint;
  chargedVRFCost: bigint;
  tokenAddress: Hex;
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
  betInputs: GenericCasinoBetInputs,
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
  const game = casinoChain.contracts.games[betInputs.game];

  if (!game) {
    throw new ChainError(
      `${betInputs.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
        errorCode: ERROR_CODES.CHAIN.GAME_NOT_AVAILABLE,
      }
    );
  }

  const accountAddress =
    betInputs.receiver || wagmiConfig.getClient({ chainId }).account?.address;
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
    const receiver = betInputs.receiver || accountAddress;
    const functionData = generatePlayGameFunctionData(
      { ...betInputs, receiver },
      chainId
    );

    // Approve if needed
    const tokenAddress =
      betInputs.tokenAddress || defaultCasinoGameInputs.tokenAddress;
    const allowanceType =
      options?.allowanceType || defaultCasinoPlaceBetOptions.allowanceType;
    const pollingInterval =
      options?.pollInterval || casinoChain.options.pollingInterval;
    const { receipt: approveReceipt, result: approveResult } = await approve(
      wagmiConfig,
      tokenAddress,
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
      betInputs.vrfFees ||
      (await getChainlinkVrfCost(
        wagmiConfig,
        game.address,
        tokenAddress,
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

    const placedBet = getPlacedBetFromReceipt(receipt, chainId, betInputs.game);
    if (!placedBet) {
      throw new TransactionError("PlaceBet event not found", {
        errorCode: ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        gameAddress: game.address,
        gameType: betInputs.game,
        chainId,
        tokenAddress: betInputs.tokenAddress,
      });
    }

    return { placedBet, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the bet: ${error}`,
      {
        errorCode: ERROR_CODES.GAME.PLACE_BET_ERROR,
        gameAddress: game.address,
        gameType: betInputs.game,
        chainId,
        tokenAddress: betInputs.tokenAddress,
        betAmount: betInputs.betAmount,
        betCount: betInputs.betCount,
        stopGain: betInputs.stopGain,
        stopLoss: betInputs.stopLoss,
      }
    );
  }
}

export function generatePlayGameFunctionData(
  gameInputs: Omit<GenericCasinoBetInputs, "receiver" | "vrfFees"> & {
    receiver: Hex;
  },
  chainId: CasinoChainId = defaultCasinoPlaceBetOptions.chainId
) {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameInputs.game];

  if (!game) {
    throw new ChainError(
      `${gameInputs.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
        errorCode: ERROR_CODES.CHAIN.GAME_NOT_AVAILABLE,
      }
    );
  }

  const affiliate = gameInputs.affiliate || casinoChain.defaultAffiliate;
  const tokenAddress =
    gameInputs.tokenAddress || defaultCasinoGameInputs.tokenAddress;
  const betCount = gameInputs.betCount || defaultCasinoGameInputs.betCount;
  const stopGain = gameInputs.stopGain || defaultCasinoGameInputs.stopGain;
  const stopLoss = gameInputs.stopLoss || defaultCasinoGameInputs.stopLoss;
  const maxHouseEdge = MAX_SDK_HOUSE_EGDE;

  const data = {
    abi: game.abi,
    functionName: "wager",
    args: [
      ...gameInputs.encodedInputs,
      gameInputs.receiver,
      affiliate,
      {
        token: tokenAddress,
        betAmount: gameInputs.betAmount,
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
    totalBetAmount: gameInputs.betAmount * BigInt(betCount),
    tokenAddress,
    betCount,
    stopGain,
    stopLoss,
    maxHouseEdge,
    affiliate,
  };
}

export function getPlacedBetFromReceipt(
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  game: CASINO_GAME_TYPE
): CasinoPlacedBet | null {
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
  return {
    id: args.id,
    betAmount: args.amount,
    betCount: args.betCount,
    totalBetAmount: args.amount * BigInt(args.betCount),
    chargedVRFCost: args.chargedVRFCost,
    tokenAddress: args.token,
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
