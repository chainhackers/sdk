import {
  type Address,
  type Hash,
  type Hex,
  type TransactionReceipt,
  encodeFunctionData,
  formatUnits,
  parseAbiItem,
} from "viem";
import { getLogs } from "viem/actions";
import { casinoGameAbi } from "../../abis/v2/casino/game";
import type { CasinoPlacedBet } from "../../actions/casino/game";
import {
  CASINO_GAME_ROLL_ABI,
  CASINO_GAME_TYPE,
  type CasinoChainId,
  casinoChainById,
  labelCasinoGameByType,
} from "../../data/casino";
import { ERROR_CODES } from "../../errors/codes";
import { ChainError } from "../../errors/types";
import { TransactionError } from "../../errors/types";
import type {
  BetSwirlFunctionData,
  CasinoGame,
  CasinoGameToken,
  CasinoToken,
  Token,
} from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { chainNativeCurrencyToToken, decodeCasinoRolled } from "../../utils";
import { getCasinoChainId } from "../../utils/chains";
import { FORMAT_TYPE, formatRawAmount } from "../../utils/format";
import { getTransactionReceiptWithRetry } from "../../utils/wallet";

export interface CasinoRolledBet extends CasinoPlacedBet {
  isWin: boolean;
  isLost: boolean;
  isStopLossTriggered: boolean;
  isStopGainTriggered: boolean;
  rollBetCount: number;
  rollTotalBetAmount: bigint;
  formattedRollTotalBetAmount: string;
  payout: bigint;
  formattedPayout: string;
  benefit: bigint;
  formattedBenefit: string;
  formattedPayoutMultiplier: string;
  rollTxnHash: Hash;
  encodedRolled: any[];
  decodedRolled: any[];
  nativeCurrency: Token;
  // Placed bet formatted properties
  formattedBetAmount: string;
  formattedTotalBetAmount: string;
  formattedStopLoss: string;
  formattedStopGain: string;
  formattedChargedVRFFees: string;
}

export interface CasinoWaitRollOptions {
  pollingInterval?: number;
  timeout?: number;
  formatType?: FORMAT_TYPE;
}

export const defaultCasinoWaiRollOptions = {
  timeout: 120000, // 2 mins
  //pollingInterval: => data in casino.ts
};

interface RollEventArgs {
  id?: bigint;
  payout?: bigint;
  totalBetAmount?: bigint;
  rolled?: any[];
}

// Interface pour le log complet
interface RollEvent {
  args: RollEventArgs;
  transactionHash: Hash;
}

export function formatCasinoRolledBet(
  placedBet: CasinoPlacedBet,
  rollEvent: RollEvent,
  formatType: FORMAT_TYPE = FORMAT_TYPE.STANDARD,
): CasinoRolledBet {
  const args = rollEvent.args;
  const isWin = args.payout! >= args.totalBetAmount!;
  const isStopTriggered = args.rolled!.length !== placedBet.betCount;
  const casinoChain = casinoChainById[placedBet.chainId];
  const nativeCurrency = chainNativeCurrencyToToken(casinoChain.viemChain.nativeCurrency);
  const tokenDecimals = placedBet.token.decimals;

  return {
    ...placedBet,
    isWin,
    isLost: !isWin,
    isStopGainTriggered: isStopTriggered && isWin,
    isStopLossTriggered: isStopTriggered && !isWin,
    rollBetCount: args.rolled!.length,
    rollTotalBetAmount: args.totalBetAmount!,
    formattedRollTotalBetAmount: formatRawAmount(
      args.totalBetAmount!,
      placedBet.token.decimals,
      formatType,
    ),
    payout: args.payout!,
    formattedPayout: formatRawAmount(args.payout!, placedBet.token.decimals, formatType),
    benefit: args.payout! - args.totalBetAmount!,
    formattedBenefit: formatRawAmount(
      args.payout! - args.totalBetAmount!,
      placedBet.token.decimals,
      formatType,
    ),
    formattedPayoutMultiplier: (
      Number(formatUnits(args.payout!, tokenDecimals)) /
      Number(formatUnits(args.totalBetAmount!, tokenDecimals))
    ).toFixed(3),
    rollTxnHash: rollEvent.transactionHash,
    encodedRolled: args.rolled! as any[],
    decodedRolled: args.rolled!.map((r) => decodeCasinoRolled(r, placedBet.game)),
    nativeCurrency,
    // Placed bet formatted properties
    formattedBetAmount: formatRawAmount(placedBet.betAmount, tokenDecimals, formatType),
    formattedTotalBetAmount: formatRawAmount(placedBet.totalBetAmount, tokenDecimals, formatType),
    formattedStopLoss: formatRawAmount(placedBet.stopLoss, tokenDecimals, formatType),
    formattedStopGain: formatRawAmount(placedBet.stopGain, tokenDecimals, formatType),
    formattedChargedVRFFees: formatRawAmount(
      placedBet.chargedVRFCost,
      nativeCurrency.decimals,
      formatType,
    ),
  };
}

export async function waitRolledBet(
  wallet: BetSwirlWallet,
  placedBet: CasinoPlacedBet,
  options?: CasinoWaitRollOptions,
): Promise<{
  rolledBet: CasinoRolledBet;
  receipt: TransactionReceipt;
}> {
  const casinoChain = casinoChainById[placedBet.chainId];
  const game = casinoChain.contracts.games[placedBet.game];
  if (!game) {
    throw new ChainError(
      `Game ${placedBet.game} not found for chain ${placedBet.chainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId: placedBet.chainId,
        game: placedBet.game,
      },
    );
  }

  return new Promise((resolve, reject) => {
    let isResolved = false;

    const onRollEvent = async (log: RollEvent) => {
      if (isResolved) return;
      isResolved = true;
      unwatch?.();

      try {
        const receipt = await getTransactionReceiptWithRetry(wallet, log.transactionHash);

        resolve({
          rolledBet: formatCasinoRolledBet(placedBet, log, options?.formatType),
          receipt,
        });
      } catch (error) {
        reject(
          new TransactionError("Error processing Roll event", ERROR_CODES.GAME.ROLL_EVENT_ERROR, {
            betId: placedBet.id,
            chainId: placedBet.chainId,
            cause: error,
          }),
        );
      }
    };
    // Subcribe to Roll event
    const unwatch = wallet.watchContractEvent({
      data: {
        to: game.address,
        abi: game.abi,
        eventName: "Roll",
        args: { id: placedBet.id },
        pollingInterval: options?.pollingInterval || casinoChain.options.pollingInterval,
      },
      callbacks: {
        onLogs: async (logs) => {
          const matchingLog = (logs as unknown as { args: { id: bigint } }[]).find(
            (log) => log.args.id === placedBet.id,
          );
          if (matchingLog) {
            await onRollEvent(matchingLog as unknown as RollEvent);
          }
        },
        onError: (_error) => {
          // Nothing to do, the watching continues...
          /*reject(
            new TransactionError(
              "Error watching Roll event",
              ERROR_CODES.GAME.ROLL_EVENT_ERROR,
              {
                betId: placedBet.id,
                chainId: placedBet.chainId,
                cause: error,
              }
            )
          ); */
        },
      },
    });

    const publicClient = wallet.getPublicClient(placedBet.chainId);

    // Check in the past blocks if the bet has been rolled
    getLogs(publicClient, {
      address: game.address,
      event: parseAbiItem(CASINO_GAME_ROLL_ABI[placedBet.game]),
      args: { id: placedBet.id },
      fromBlock: placedBet.betBlock,
      toBlock: "latest",
    })
      .then((pastLogs) => {
        const matchingPastLog = pastLogs.find((log) => log.args.id === placedBet.id);
        if (matchingPastLog) {
          onRollEvent(matchingPastLog as RollEvent);
        }
      })
      .catch((error) => {
        if (!isResolved) {
          console.warn("Error checking past Roll events", error);
          /*reject(
            new TransactionError(
              "Error checking past Roll events",
              ERROR_CODES.GAME.ROLL_EVENT_ERROR,
              {
                betId: placedBet.id,
                chainId: placedBet.chainId,
                cause: error,
              }
            )
          ); */
        }
      });

    setTimeout(() => {
      if (!isResolved) {
        unwatch?.();
        reject(
          new TransactionError(
            "Timeout waiting for Roll event",
            ERROR_CODES.GAME.ROLL_EVENT_TIMEOUT,
            {
              betId: placedBet.id,
              chainId: placedBet.chainId,
            },
          ),
        );
      }
    }, options?.timeout || defaultCasinoWaiRollOptions.timeout);
  });
}

export type RawPaused = boolean;

export async function getCasinoGames(
  wallet: BetSwirlWallet,
  onlyActive = false,
): Promise<CasinoGame[]> {
  const casinoChainId = getCasinoChainId(wallet);

  const casinoChain = casinoChainById[casinoChainId];

  const games = casinoChain.contracts.games;

  const functionDatas = Object.keys(games).map((game) =>
    getGamePausedFunctionData(game as CASINO_GAME_TYPE, casinoChainId),
  );
  const rawPauseds = await wallet.readContracts<typeof functionDatas, RawPaused[]>(functionDatas);

  return Object.entries(games)
    .map(([gameType, game], index) => ({
      gameAddress: game.address,
      abi: game.abi,
      paused: Boolean(rawPauseds[index]),
      chainId: casinoChainId,
      game: gameType as CASINO_GAME_TYPE,
      label: labelCasinoGameByType[gameType as CASINO_GAME_TYPE],
      bankAddress: casinoChain.contracts.bank,
    }))
    .filter((game) => !onlyActive || !game.paused);
}

export async function getCasinoGamePaused(wallet: BetSwirlWallet, game: CASINO_GAME_TYPE) {
  const casinoChainId = getCasinoChainId(wallet);
  const casinoChain = casinoChainById[casinoChainId];
  const gameAddress = casinoChain.contracts.games[game]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${game} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }
  const functionData = getGamePausedFunctionData(game, casinoChainId);
  const rawPaused = await wallet.readContract<typeof functionData, RawPaused>(functionData);
  return rawPaused;
}

export function getGamePausedFunctionData(
  game: CASINO_GAME_TYPE,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof casinoGameAbi, "paused", readonly []> {
  const casinoChain = casinoChainById[casinoChainId];

  const gameAddress = casinoChain.contracts.games[game]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${game} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = casinoGameAbi;
  const functionName = "paused" as const;
  const args = [] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

/**
 * Raw token info data returned by the smart contract
 * [0] - houseEdge: House edge rate (BP_VALUE)
 * [1] - pendingCount: Number of pending bets
 * [2] - vrfSubId: Chainlink VRF v2.5 subscription ID
 * [3] - VRFCallbackGasBase: How much gas is needed in the Chainlink VRF callback
 * [4] - VRFFees: Chainlink's VRF collected fees amount.
 */
export type RawTokenInfo = [number, bigint, bigint, number, bigint];

export type RawAffiliateHouseEdge = bigint;

export function parseRawTokenInfoAndAffiliateHouseEdge(
  rawTokenInfo: RawTokenInfo,
  rawAffiliateHouseEdge: RawAffiliateHouseEdge,
  casinoToken: CasinoToken,
  game: CASINO_GAME_TYPE,
): CasinoGameToken {
  const defaultHouseEdge = rawTokenInfo[0];
  return {
    ...casinoToken,
    game,
    defaultHouseEdge: defaultHouseEdge,
    defaultHouseEdgePercent: defaultHouseEdge / 100,
    chainlinkVrfSubscriptionId: rawTokenInfo[2],
    affiliateHouseEdge: Number(rawAffiliateHouseEdge),
    affiliateHouseEdgePercent: Number(rawAffiliateHouseEdge) / 100,
  };
}

export async function getCasinoGameToken(
  wallet: BetSwirlWallet,
  casinoToken: CasinoToken,
  game: CASINO_GAME_TYPE,
  affiliate: Hex,
): Promise<CasinoGameToken> {
  const chainId = casinoToken.chainId;

  const tokenInfoFunctionData = getTokenInfoFunctionData(game, casinoToken.address, chainId);
  const affiliateHouseEdgeFunctionData = getAffiliateHouseEdgeFunctionData(
    game,
    casinoToken.address,
    affiliate,
    chainId,
  );

  const functionDatas = [tokenInfoFunctionData, affiliateHouseEdgeFunctionData];
  const [rawTokenData, rawAffiliateHouseEdge] = await wallet.readContracts<
    typeof functionDatas,
    [RawTokenInfo, RawAffiliateHouseEdge]
  >(functionDatas);

  return parseRawTokenInfoAndAffiliateHouseEdge(
    rawTokenData,
    rawAffiliateHouseEdge,
    casinoToken,
    game,
  );
}

export function getTokenInfoFunctionData(
  game: CASINO_GAME_TYPE,
  tokenAddress: Address,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof casinoGameAbi, "tokens", readonly [Hex]> {
  const casinoChain = casinoChainById[casinoChainId];

  const gameAddress = casinoChain.contracts.games[game]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${game} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = casinoGameAbi;
  const functionName = "tokens" as const;
  const args = [tokenAddress] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}

export function getAffiliateHouseEdgeFunctionData(
  game: CASINO_GAME_TYPE,
  tokenAddress: Address,
  affiliate: Hex,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof casinoGameAbi, "getAffiliateHouseEdge", readonly [Hex, Hex]> {
  const casinoChain = casinoChainById[casinoChainId];

  const gameAddress = casinoChain.contracts.games[game]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Game ${game} not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = casinoGameAbi;
  const functionName = "getAffiliateHouseEdge" as const;
  const args = [affiliate, tokenAddress] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
