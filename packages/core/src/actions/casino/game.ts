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

export interface CasinoGameInputs {
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

export interface CasinoOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint; // wei
  chainId?: CasinoChainId;
  allowanceType?: ALLOWANCE_TYPE;
  pollInterval?: number;
}

export const defaultCasinoOptions = {
  gasPriceType: GAS_PRICE_TYPE.NORMAL,
  gasPrice: 0n,
  chainId: casinoChainByKey.avalanche.id,
  allowanceType: ALLOWANCE_TYPE.AUTO,
};

export interface GenericGameInputs extends CasinoGameInputs {
  game: CASINO_GAME_TYPE;
  encodedInputs: any[]; // CasinoGameInputs excluded
}

export async function placeBet(
  gameInputs: GenericGameInputs,
  wagmiConfig: WagmiConfig,
  betSwirlOptions?: CasinoOptions,
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>,
  onApproved?: (
    receipt: TransactionReceipt,
    result: ApproveResult
  ) => void | Promise<void>,
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>
) {
  const chainId = betSwirlOptions?.chainId || defaultCasinoOptions.chainId;
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

  const accountAddress =
    gameInputs.receiver || wagmiConfig.getClient({ chainId }).account?.address;
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
      betSwirlOptions?.gasPrice ||
      (await getGasPrices(wagmiConfig, chainId))[
        betSwirlOptions?.gasPriceType || defaultCasinoOptions.gasPriceType
      ];

    // Generate function data
    const receiver = gameInputs.receiver || accountAddress;
    const functionData = generatePlayGameFunctionData(
      { ...gameInputs, receiver },
      chainId
    );

    // Check Approve if needed
    const tokenAddress =
      gameInputs.tokenAddress || defaultCasinoGameInputs.tokenAddress;
    const allowanceType =
      betSwirlOptions?.allowanceType || defaultCasinoOptions.allowanceType;
    const pollingInterval =
      betSwirlOptions?.pollInterval || casinoChain.options.pollingInterval;
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

    // Get VRF fees if needed
    const vrfFees =
      gameInputs.vrfFees ||
      (await getChainlinkVrfCost(
        wagmiConfig,
        game.address,
        tokenAddress,
        functionData.betCount,
        chainId,
        gasPrice
      ));
    // Simulate play game tx
    const { request } = await simulateContract(wagmiConfig, {
      address: game.address,
      value: vrfFees,
      args: functionData.data.args,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      chainId: chainId,
      gasPrice: gasPrice,
    });

    // Execute play game tx
    const hash = await writeContract(wagmiConfig, request);
    await onBetPlacedPending?.(hash);
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId,
      pollingInterval,
    });

    return { hash, receipt };
  } catch (error) {
    throw new TransactionError(
      `An error occured while placing the bet: ${error}`,
      {
        errorCode: ERROR_CODES.GAME.PLAY_GAME_ERROR,
        gameAddress: game.address,
        gameType: gameInputs.game,
        chainId,
        tokenAddress: gameInputs.tokenAddress,
        betAmount: gameInputs.betAmount,
        betCount: gameInputs.betCount,
        stopGain: gameInputs.stopGain,
        stopLoss: gameInputs.stopLoss,
      }
    );
  }
}

export function generatePlayGameFunctionData(
  gameInputs: Omit<GenericGameInputs, "receiver" | "vrfFees"> & {
    receiver: Hex;
  },
  chainId: CasinoChainId = defaultCasinoOptions.chainId
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
