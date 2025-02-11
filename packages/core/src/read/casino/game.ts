import { type Config as WagmiConfig } from "@wagmi/core";
import {
  CASINO_GAME_ROLL_ABI,
  CASINO_GAME_TYPE,
  casinoChainById,
  labelCasinoGameByType,
  type CasinoChainId,
} from "../../data/casino";
import { ChainError } from "../../errors/types";
import type { CasinoPlacedBet } from "../../actions/casino/game";
import { watchContractEvent } from "@wagmi/core";
import { TransactionError } from "../../errors/types";
import { casinoGameAbi } from "../../abis/v2/casino/game";
import {
  parseAbiItem,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";
import { ERROR_CODES } from "../../errors/codes";
import { getLogs } from "viem/actions";
import { readContracts } from "@wagmi/core";
import type {
  CasinoGame,
  CasinoGameToken,
  CasinoToken,
} from "../../interfaces";
import { getCasinoChainId } from "../../utils/chains";
import { getTransactionReceiptWithRetry } from "../../utils/wagmi";

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
  wagmiConfig: WagmiConfig,
  placedBet: CasinoPlacedBet,
  options?: CasinoWaitRollOptions
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
      }
    );
  }

  return new Promise(async (resolve, reject) => {
    let isResolved = false;

    const onRollEvent = async (log: RollEvent) => {
      if (isResolved) return;
      isResolved = true;
      unwatch?.();

      try {
        const args = log.args;
        const isWin = args.payout! >= args.totalBetAmount!;
        const isStopTriggered = args.rolled!.length != placedBet.betCount;
        const receipt = await getTransactionReceiptWithRetry(
          wagmiConfig,
          log.transactionHash,
          placedBet.chainId
        );

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
          new TransactionError(
            "Error processing Roll event",
            ERROR_CODES.GAME.ROLL_EVENT_ERROR,
            {
              betId: placedBet.id,
              chainId: placedBet.chainId,
              cause: error,
            }
          )
        );
      }
    };
    // Subcribe to Roll event
    const unwatch = watchContractEvent(wagmiConfig, {
      address: game.address,
      abi: game.abi,
      eventName: "Roll",
      args: { id: placedBet.id },
      chainId: placedBet.chainId,
      pollingInterval:
        options?.pollingInterval || casinoChain.options.pollingInterval,
      onLogs: async (logs) => {
        const matchingLog = (
          logs as unknown as { args: { id: bigint } }[]
        ).find((log) => log.args.id === placedBet.id);
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
    });

    const wagmiClient = wagmiConfig.getClient({ chainId: placedBet.chainId });

    // Check in the past blocks if the bet has been rolled
    getLogs(wagmiClient, {
      address: game.address,
      event: parseAbiItem(CASINO_GAME_ROLL_ABI[placedBet.game]),
      args: { id: placedBet.id },
      fromBlock: placedBet.placeBetBlock,
      toBlock: "latest",
    })
      .then((pastLogs) => {
        const matchingPastLog = pastLogs.find(
          (log) => log.args.id === placedBet.id
        );
        if (matchingPastLog) {
          onRollEvent(matchingPastLog as RollEvent);
        }
      })
      .catch((error) => {
        if (!isResolved) {
          reject(
            new TransactionError(
              "Error checking past Roll events",
              ERROR_CODES.GAME.ROLL_EVENT_ERROR,
              {
                betId: placedBet.id,
                chainId: placedBet.chainId,
                cause: error,
              }
            )
          );
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
            }
          )
        );
      }
    }, options?.timeout || defaultCasinoWaiRollOptions.timeout);
  });
}

export async function getCasinoGames(
  wagmiConfig: WagmiConfig,
  chainId?: CasinoChainId,
  onlyActive = false
): Promise<CasinoGame[]> {
  const casinoChainId = getCasinoChainId(wagmiConfig, chainId);

  const casinoChain = casinoChainById[casinoChainId];

  const games = casinoChain.contracts.games;

  const pausedStates = await readContracts(wagmiConfig, {
    contracts: Object.values(games).map((game) => ({
      address: game.address,
      abi: casinoGameAbi,
      functionName: "paused",
      chainId,
    })),
  });

  if (
    pausedStates.some(
      (state) => state.status === "failure" || state == undefined
    )
  ) {
    throw new TransactionError(
      "Error getting paused states",
      ERROR_CODES.GAME.GET_PAUSED_ERROR,
      {
        chainId,
        cause: pausedStates.find((state) => state.status === "failure")?.error,
      }
    );
  }

  return Object.entries(games)
    .map(([gameType, game], index) => ({
      gameAddress: game.address,
      abi: game.abi,
      paused: Boolean(pausedStates[index]?.result),
      chainId: casinoChainId,
      game: gameType as CASINO_GAME_TYPE,
      label: labelCasinoGameByType[gameType as CASINO_GAME_TYPE],
      bankAddress: casinoChain.contracts.bank,
    }))
    .filter((game) => !onlyActive || !game.paused);
}

export async function getCasinoGameToken(
  wagmiConfig: WagmiConfig,
  casinoToken: CasinoToken,
  game: CASINO_GAME_TYPE,
  affiliate: Hex
): Promise<CasinoGameToken> {
  const chainId = casinoToken.chainId;
  const casinoChain = casinoChainById[chainId];
  const casinoGame = casinoChain.contracts.games[game];
  if (!casinoGame) {
    throw new ChainError(
      `Game ${game} not found for chain ${chainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
      {
        chainId,
        game,
      }
    );
  }
  const [rawTokenData, rawAffiliateHouseEdge] = await readContracts(
    wagmiConfig,
    {
      contracts: [
        {
          address: casinoGame.address,
          abi: casinoGameAbi,
          functionName: "tokens",
          chainId,
          args: [casinoToken.address],
        },
        {
          address: casinoGame.address,
          abi: casinoGameAbi,
          functionName: "getAffiliateHouseEdge",
          chainId,
          args: [affiliate, casinoToken.address],
        },
      ],
    }
  );

  if (rawTokenData.status === "failure" || !rawTokenData.result) {
    throw new TransactionError(
      "Error getting token data",
      ERROR_CODES.GAME.GET_TOKEN_ERROR,
      {
        chainId,
        cause: rawTokenData.error,
      }
    );
  }

  if (
    rawAffiliateHouseEdge.status === "failure" ||
    !rawAffiliateHouseEdge.result
  ) {
    throw new TransactionError(
      "Error getting affiliate house edge",
      ERROR_CODES.GAME.GET_AFFILIATE_HOUSE_EDGE_ERROR,
      {
        chainId,
        cause: rawAffiliateHouseEdge.error,
      }
    );
  }
  const defaultHouseEdge = rawTokenData.result?.[0];
  return {
    ...casinoToken,
    game,
    defaultHouseEdge: defaultHouseEdge,
    defaultHouseEdgePercent: defaultHouseEdge / 100,
    chainlinkVrfSubscriptionId: rawTokenData.result?.[2],
    affiliateHouseEdge: rawAffiliateHouseEdge.result,
    affiliateHouseEdgePercent: rawAffiliateHouseEdge.result / 100,
  };
}
