import { encodeFunctionData } from "viem";
import { weightedGameAbi } from "../../abis";
import { CASINO_GAME_TYPE, type CasinoChainId, casinoChainById } from "../../data/casino";
import { ChainError, ERROR_CODES, TransactionError } from "../../errors";
import type { BetSwirlFunctionData } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider/wallet";
import { getCasinoChainId } from "../../utils/chains";

export const gameIdByWeightedGameId = {
  [1]: CASINO_GAME_TYPE.WHEEL,
  /*[2]: Plinko,
  [3]: Mines,
  [4]: Diamonds,
  [5]: SLIDE,
  [6]: Slot,*/
} as const;

/**
 * Raw weighted game config data returned by the smart contract
 * [0] - weightRanges: The weight of each segment (sorted by ranges). e.g. [100, 250, 300] means the first segment has 100 weight, the second one has 150 weight, and the last one has 50 weight.
 * [1] - multipliers: The multiplier of each segment (BP)
 * [2] - maxMultiplier: The highest multiplier of the configuration (BP)
 * [3] - gameId: The weighted game id (used to identify the weighted game the configuration has been created for)
 */
export type RawWeightedGameConfiguration = {
  weightRanges: bigint[];
  multipliers: bigint[];
  maxMultiplier: bigint;
  gameId: number;
};

export function parseRawWeightedGameConfiguration(
  rawConfiguration: RawWeightedGameConfiguration,
  configId: number | string,
  casinoChainId: CasinoChainId,
): WeightedGameConfiguration {
  return {
    chainId: casinoChainId,
    configId: Number(configId),
    // Convert weight ranges into weights
    weights: rawConfiguration.weightRanges.map((v, i) =>
      i === 0 ? v : v - rawConfiguration.weightRanges[i - 1]!,
    ),
    multipliers: rawConfiguration.multipliers,
    game: gameIdByWeightedGameId[rawConfiguration.gameId as keyof typeof gameIdByWeightedGameId],
  };
}

export interface WeightedGameConfiguration {
  configId: number;
  game: CASINO_GAME_TYPE;
  chainId: CasinoChainId;
  weights: bigint[]; // BP
  multipliers: bigint[]; // BP
  colors?: string[];
  label?: string;
}

export async function getWeightedGameConfiguration(
  wallet: BetSwirlWallet,
  configId: number | string,
): Promise<WeightedGameConfiguration> {
  const casinoChainId = getCasinoChainId(wallet);

  try {
    const functionData = getWeightedGameConfigurationFunctionData(configId, casinoChainId);
    const rawConfiguration = await wallet.readContract<
      typeof functionData,
      RawWeightedGameConfiguration
    >(functionData);

    return parseRawWeightedGameConfiguration(rawConfiguration, configId, casinoChainId);
  } catch (error) {
    throw new TransactionError(
      "Error getting weighted game configuration",
      ERROR_CODES.GAME.GET_WEIGHTED_GAME_CONFIGURATION_ERROR,
      {
        chainId: casinoChainId,
        configId,
        cause: error,
      },
    );
  }
}

export function getWeightedGameConfigurationFunctionData(
  configId: number | string,
  casinoChainId: CasinoChainId,
): BetSwirlFunctionData<typeof weightedGameAbi, "gameConfigs", readonly [number]> {
  const casinoChain = casinoChainById[casinoChainId];
  // Use WHEEL address here because Wheel is the first weighted game created
  const gameAddress = casinoChain.contracts.games[CASINO_GAME_TYPE.WHEEL]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Weighted game contract (wheel) not found for chain ${casinoChainId}`,
      ERROR_CODES.CHAIN.UNSUPPORTED_GAME,
    );
  }

  const abi = weightedGameAbi;
  const functionName = "gameConfigs" as const;
  const args = [Number(configId)] as const;
  return {
    data: { to: gameAddress, abi, functionName, args },
    encodedData: encodeFunctionData({
      abi,
      functionName,
      args,
    }),
  };
}
