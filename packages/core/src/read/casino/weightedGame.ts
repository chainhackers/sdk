import { encodeFunctionData } from "viem";
import { weightedGameAbi } from "../../abis";
import { chainByKey } from "../../data";
import {
  CASINO_GAME_TYPE,
  type CasinoChainId,
  casinoChainById,
  type WEIGHTED_CASINO_GAME_TYPE,
} from "../../data/casino";
import { ChainError, ERROR_CODES, TransactionError } from "../../errors";
import type { BetSwirlFunctionData } from "../../interfaces";
import type { BetSwirlWallet } from "../../provider/wallet";
import { getCasinoChainId } from "../../utils/chains";
import type { CasinoRolledBet } from "./game";

const normalWheelConfiguration = {
  configId: 0,
  weights: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
  multipliers: [0n, 14580n, 0n, 18760n, 0n, 20830n, 0n, 14580n, 0n, 31250n],
  colors: [
    "#29384C",
    "#55DC36",
    "#29384C",
    "#15A2D8",
    "#29384C",
    "#7340F4",
    "#29384C",
    "#55DC36",
    "#29384C",
    "#EC9E3C",
  ],
  label: "Normal",
  game: CASINO_GAME_TYPE.WHEEL,
};

const safePlinkoConfiguration = {
  configId: 1,
  weights: [3n, 30n, 120n, 350n, 1055n, 2231n, 2422n, 2231n, 1055n, 350n, 120n, 30n, 3n],
  multipliers: [
    104167n,
    31250n,
    16667n,
    14584n,
    11459n,
    10417n,
    5209n,
    10417n,
    11459n,
    14584n,
    16667n,
    31250n,
    104167n,
  ],
  colors: [
    "#ff003f",
    "#ff2035",
    "#ff402a",
    "#ff6020",
    "#ff8015",
    "#ffa00b",
    "#ffc000",
    "#ffa00b",
    "#ff8015",
    "#ff6020",
    "#ff402a",
    "#ff2035",
    "#ff003f",
  ],
  label: "Safe",
  game: CASINO_GAME_TYPE.PLINKO,
};

type WeightedGameCachedConfigurationsPerChain = {
  [chainId in CasinoChainId]: CachedWeightedGameConfiguration[];
};

export const wheelCachedConfigurations: WeightedGameCachedConfigurationsPerChain = {
  [chainByKey.arbitrumSepolia.id]: [
    { ...normalWheelConfiguration, chainId: chainByKey.arbitrumSepolia.id },
  ],
  [chainByKey.avalancheFuji.id]: [
    { ...normalWheelConfiguration, chainId: chainByKey.avalancheFuji.id },
  ],
  [chainByKey.polygonAmoy.id]: [
    { ...normalWheelConfiguration, chainId: chainByKey.polygonAmoy.id },
  ],
  [chainByKey.baseSepolia.id]: [
    { ...normalWheelConfiguration, chainId: chainByKey.baseSepolia.id },
  ],
  [chainByKey.arbitrum.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.arbitrum.id }],
  [chainByKey.avalanche.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.avalanche.id }],
  [chainByKey.polygon.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.polygon.id }],
  [chainByKey.bsc.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.bsc.id }],
  [chainByKey.base.id]: [{ ...normalWheelConfiguration, chainId: chainByKey.base.id }],
};

export const plinkoCachedConfigurations: WeightedGameCachedConfigurationsPerChain = {
  [chainByKey.arbitrumSepolia.id]: [
    { ...safePlinkoConfiguration, chainId: chainByKey.arbitrumSepolia.id },
  ],
  [chainByKey.avalancheFuji.id]: [
    { ...safePlinkoConfiguration, chainId: chainByKey.avalancheFuji.id },
  ],
  [chainByKey.polygonAmoy.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.polygonAmoy.id }],
  [chainByKey.baseSepolia.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.baseSepolia.id }],
  [chainByKey.arbitrum.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.arbitrum.id }],
  [chainByKey.avalanche.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.avalanche.id }],
  [chainByKey.polygon.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.polygon.id }],
  [chainByKey.bsc.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.bsc.id }],
  [chainByKey.base.id]: [{ ...safePlinkoConfiguration, chainId: chainByKey.base.id }],
};

export const weightedGameCachedConfigurationsByGame: Record<
  WEIGHTED_CASINO_GAME_TYPE,
  WeightedGameCachedConfigurationsPerChain | undefined
> = {
  [CASINO_GAME_TYPE.WHEEL]: wheelCachedConfigurations,
  [CASINO_GAME_TYPE.PLINKO]: plinkoCachedConfigurations,
  [CASINO_GAME_TYPE.CUSTOM_WEIGHTED_GAME]: undefined,
};

export const weightedGameCachedConfigurations: WeightedGameCachedConfigurationsPerChain = {
  [chainByKey.arbitrumSepolia.id]: [
    ...wheelCachedConfigurations[chainByKey.arbitrumSepolia.id],
    ...plinkoCachedConfigurations[chainByKey.arbitrumSepolia.id],
  ],
  [chainByKey.avalancheFuji.id]: [
    ...wheelCachedConfigurations[chainByKey.avalancheFuji.id],
    ...plinkoCachedConfigurations[chainByKey.avalancheFuji.id],
  ],
  [chainByKey.polygonAmoy.id]: [
    ...wheelCachedConfigurations[chainByKey.polygonAmoy.id],
    ...plinkoCachedConfigurations[chainByKey.polygonAmoy.id],
  ],
  [chainByKey.baseSepolia.id]: [...wheelCachedConfigurations[chainByKey.baseSepolia.id]],
  [chainByKey.arbitrum.id]: [
    ...wheelCachedConfigurations[chainByKey.arbitrum.id],
    ...plinkoCachedConfigurations[chainByKey.arbitrum.id],
  ],
  [chainByKey.avalanche.id]: [
    ...wheelCachedConfigurations[chainByKey.avalanche.id],
    ...plinkoCachedConfigurations[chainByKey.avalanche.id],
  ],
  [chainByKey.polygon.id]: [
    ...wheelCachedConfigurations[chainByKey.polygon.id],
    ...plinkoCachedConfigurations[chainByKey.polygon.id],
  ],
  [chainByKey.bsc.id]: [
    ...wheelCachedConfigurations[chainByKey.bsc.id],
    ...plinkoCachedConfigurations[chainByKey.bsc.id],
  ],
  [chainByKey.base.id]: [
    ...wheelCachedConfigurations[chainByKey.base.id],
    ...plinkoCachedConfigurations[chainByKey.base.id],
  ],
};

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

export interface CachedWeightedGameConfiguration extends WeightedGameConfiguration {
  colors: string[];
  label: string;
}

export async function getWeightedGameConfiguration(
  wallet: BetSwirlWallet,
  configId: number | string,
): Promise<WeightedGameConfiguration> {
  const casinoChainId = getCasinoChainId(wallet);

  try {
    // Check if the configuration is in the cached configurations to save a fetch is it is the case.
    const cachedConfigurations = weightedGameCachedConfigurations[casinoChainId];
    if (cachedConfigurations) {
      const existingCachedConfiguration = cachedConfigurations.find(
        (c) => c.configId === Number(configId),
      );
      if (existingCachedConfiguration) {
        return existingCachedConfiguration;
      }
    }
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
  // Use WHEEL address here because Wheel is the first created weighted game
  const gameAddress = casinoChain.contracts.games[CASINO_GAME_TYPE.WHEEL]?.address;
  if (!gameAddress) {
    throw new ChainError(
      `Weighted game contract not found for chain ${casinoChainId}`,
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

export interface WeightedGameRolledBet extends Omit<CasinoRolledBet, "decodedRoll"> {
  rolled: string[]; // multipliers (eg. x3.24)
}

// waitRolledBet and formatCasinoRolledBet are in game.ts
