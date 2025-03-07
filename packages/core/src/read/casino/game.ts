import {
  type Address,
  type Hash,
  type Hex,
  type TransactionReceipt,
  encodeFunctionData,
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
} from "../../interfaces";
import type { BetSwirlWallet } from "../../provider";
import { getCasinoChainId } from "../../utils/chains";
import { getTransactionReceiptWithRetry } from "../../utils/wallet";

export interface CasinoRolledBet extends CasinoPlacedBet {
  isWin: boolean;
  isStopLossTriggered: boolean;
  isStopGainTriggered: boolean;
  rolledBetCount: number;
  rollTotalBetAmount: bigint;
  payout: bigint;
  benefit: bigint;
  rollTx: Hash;
  encodedRolled: any[];
}

export interface CasinoWaitRollOptions {
  pollingInterval?: number;
  timeout?: number;
}

export const defaultCasinoWaiRollOptions = {
  timeout: 120000, // 2 mins
  //pollInterval: => data in casino.ts
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
        const args = log.args;
        const isWin = args.payout! >= args.totalBetAmount!;
        const isStopTriggered = args.rolled!.length !== placedBet.betCount;
        const receipt = await getTransactionReceiptWithRetry(wallet, log.transactionHash);

        resolve({
          rolledBet: {
            ...placedBet,
            isWin,
            rolledBetCount: args.rolled!.length,
            rollTotalBetAmount: args.totalBetAmount!,
            payout: args.payout!,
            benefit: args.payout! - args.totalBetAmount!,
            rollTx: log.transactionHash,
            isStopGainTriggered: isStopTriggered && isWin,
            isStopLossTriggered: isStopTriggered && !isWin,
            encodedRolled: args.rolled! as any[],
          },
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
      fromBlock: placedBet.placeBetBlock,
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
