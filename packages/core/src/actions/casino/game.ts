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
  MAX_SDK_HOUSE_EGDE,
  type CasinoChainId,
} from "../../data/casino";
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
} from "../../errors/types";
import { ERROR_CODES } from "../../errors/codes";
import { ALLOWANCE_TYPE, approve, type ApproveResult } from "../common/approve";
import { GAS_PRICE_TYPE, getGasPrices } from "../../read/common/gasPrice";
import { getChainlinkVrfCost } from "../../read/common/chainlinkVrfCost";
import { decodeEventLog } from "viem";
import { coinTossAbi } from "../../abis/v2/casino/coinToss";
import type { Token } from "../../interfaces";
import { chainNativeCurrencyToToken } from "../../utils/tokens";
import { getTokenMetadata } from "../common/tokenMetadata";
import { chainByKey } from "../../data";
import { getAccountFromWagmiConfig } from "../../utils/wagmi";
import { GAS_TOKEN_ADDRESS } from "../../constants";

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
  chainId: chainByKey.avalanche.id,
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

export interface PlaceBetCallbacks {
  onApprovePending?: (tx: Hash, result: ApproveResult) => void | Promise<void>;
  onApproved?: (
    receipt: TransactionReceipt,
    result: ApproveResult
  ) => void | Promise<void>;
  onBetPlacedPending?: (tx: Hash) => void | Promise<void>;
}

export async function placeBet(
  wagmiConfig: WagmiConfig,
  betParams: GenericCasinoBetParams,
  options?: CasinoPlaceBetOptions,
  callbacks?: PlaceBetCallbacks
): Promise<{ placedBet: CasinoPlacedBet; receipt: TransactionReceipt }> {
  const chainId = options?.chainId || defaultCasinoPlaceBetOptions.chainId;
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[betParams.game];

  if (!game) {
    throw new ChainError(
      `${betParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      }
    );
  }

  const accountAddress =
    betParams.receiver || wagmiConfig.getClient({ chainId }).account?.address;
  if (!accountAddress) {
    throw new ConfigurationError(
      `No configured account in wagmi config for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.WAGMI.ACCOUNT_MISSING,
      {
        chainId,
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
    const token =
      betParams.token ||
      chainNativeCurrencyToToken(casinoChain.viemChain.nativeCurrency);

    // Generate function data
    const receiver = betParams.receiver || accountAddress;
    const functionData = getPlaceBetFunctionData(
      { ...betParams, receiver, tokenAddress: token.address },
      chainId
    );

    // Approve if needed

    const allowanceType =
      options?.allowanceType || defaultCasinoPlaceBetOptions.allowanceType;
    const pollingInterval =
      options?.pollInterval || casinoChain.options.pollingInterval;

    const { receipt: approveReceipt, result: approveResult } = await approve(
      wagmiConfig,
      token.address,
      accountAddress,
      game.address,
      functionData.formattedData.totalBetAmount,
      chainId,
      gasPrice,
      pollingInterval,
      allowanceType,
      callbacks?.onApprovePending
    );

    if (approveReceipt)
      await callbacks?.onApproved?.(approveReceipt, approveResult);

    // Get VRF fees
    const vrfFees =
      betParams.vrfFees ||
      (await getChainlinkVrfCost(
        wagmiConfig,
        betParams.game,
        token.address,
        functionData.formattedData.betCount,
        chainId,
        gasPrice
      ));

    // Simulate place bet tx

    const { request } = await simulateContract(wagmiConfig, {
      address: functionData.data.to,
      value:
        token.address == zeroAddress
          ? functionData.formattedData.totalBetAmount + vrfFees
          : vrfFees,
      args: functionData.data.args,
      abi: functionData.data.abi,
      functionName: functionData.data.functionName,
      chainId: chainId,
      gasPrice: gasPrice,
      account: getAccountFromWagmiConfig(wagmiConfig, chainId),
    });
    // Execute place bet tx
    const hash = await writeContract(wagmiConfig, request);
    await callbacks?.onBetPlacedPending?.(hash);
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
      throw new TransactionError(
        "PlaceBet event not found",
        ERROR_CODES.GAME.PLACE_BET_EVENT_NOT_FOUND,
        {
          gameAddress: game.address,
          gameType: betParams.game,
          chainId,
          token,
        }
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

export function getPlaceBetFunctionData(
  gameParams: Omit<GenericCasinoBetParams, "receiver" | "vrfFees" | "token"> & {
    receiver: Hex;
    tokenAddress?: Hex;
  },
  chainId: CasinoChainId = defaultCasinoPlaceBetOptions.chainId
) {
  const casinoChain = casinoChainById[chainId];
  const game = casinoChain.contracts.games[gameParams.game];

  if (!game) {
    throw new ChainError(
      `${gameParams.game} is not available for chain ${casinoChain.viemChain.name} (${chainId})`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      }
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
    ...gameParams.gameEncodedExtraParams,
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

  return {
    data: { to: game.address, abi, functionName, args },
    encodedData: encodeFunctionData({ abi, functionName, args }),
    formattedData: {
      totalBetAmount: gameParams.betAmount * BigInt(betCount),
      tokenAddress,
      betCount,
      stopGain,
      stopLoss,
      maxHouseEdge,
      affiliate,
    },
  };
}

export async function getPlacedBetFromReceipt(
  wagmiConfig: WagmiConfig,
  receipt: TransactionReceipt,
  chainId: CasinoChainId,
  game: CASINO_GAME_TYPE,
  usedToken?: Token // to avoid to fetch the token metadata from the chain if the token used is already known
): Promise<CasinoPlacedBet | null> {
  const casinoChain = casinoChainById[chainId];
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
