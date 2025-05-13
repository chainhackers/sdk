import {
  type CasinoChainId,
  type WEIGHTED_CASINO_GAME_TYPE,
  type WeightedGameConfiguration,
  getFormattedNetMultiplier,
  weightedGameCachedConfigurations,
} from "../..";
import { getNetMultiplier } from "../..";
import { BP_VALUE } from "../../constants";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

export type WeightedGameConfigId = number;

export interface WeightedGameChoiceInput extends ChoiceInput<WEIGHTED_CASINO_GAME_TYPE> {
  value: WeightedGameConfigId;
  config: WeightedGameConfiguration;
  id: WeightedGameConfigId;
}

export type WeightedGameEncodedInput = number; // configId
export type WeightedGameEncodedRolled = number; // the position of the rolled multiplier

export class WeightedGame extends AbstractCasinoGame<
  string,
  WeightedGameEncodedInput,
  string,
  WeightedGameEncodedRolled
> {
  static getWinChancePercent(
    weightedGameConfig: WeightedGameConfiguration,
    position: number,
  ): number {
    /*const multipliersPositions = weightedGameConfig.multipliers.map((w, i) => w === multiplier ? i : null).filter(m => m !== null)

    const weights = weightedGameConfig.weights.filter((_, i) => multipliersPositions.includes(i))
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n)
    const totalWeightForMultiplier = weights.reduce((acc, curr) => acc + curr, 0n)

    return Number(totalWeightForMultiplier) / Number(totalWeight) * 100 */

    const weight = weightedGameConfig.weights[position];
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n);
    return (Number(weight) / Number(totalWeight)) * 100;
  }

  static getMultiplier(weightedGameConfig: WeightedGameConfiguration, position: number): number {
    return Number(weightedGameConfig.multipliers[position] ?? 0);
  }

  static getFormattedMultiplier(
    weightedGameConfig: WeightedGameConfiguration,
    position: number,
  ): number {
    return Number((WeightedGame.getMultiplier(weightedGameConfig, position) / BP_VALUE).toFixed(3));
  }

  static encodeInput(configId: WeightedGameConfigId): WeightedGameEncodedInput {
    return configId;
  }

  static decodeInput(configId: WeightedGameEncodedInput | string): WeightedGameConfigId {
    return Number(configId);
  }

  static decodeRolled(
    encodedRolled: WeightedGameEncodedRolled | string,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: number,
  ): string {
    const multiplier = weightedGameConfiguration.multipliers[Number(encodedRolled)];
    const netMultiplier = (Number(multiplier) * (1 - houseEdge / BP_VALUE)) / BP_VALUE;
    return `x${netMultiplier.toFixed(2)}`;
  }

  static getChoiceInputs(
    chainId: CasinoChainId,
    houseEdge?: number,
    customWeightedGameConfigs?: WeightedGameConfiguration[],
  ): WeightedGameChoiceInput[] {
    const weightedGameConfigs = [
      ...weightedGameCachedConfigurations[chainId],
      ...(customWeightedGameConfigs ?? []),
    ];
    return weightedGameConfigs.map((config) => {
      const multipliers = config.multipliers;
      return {
        value: config.configId,
        config: config,
        id: config.configId,
        game: config.game,
        label: WeightedGame.getWeightedGameConfigLabel(
          config.configId,
          chainId,
          customWeightedGameConfigs,
        ),
        winChancePercent: multipliers.map((_, index) =>
          WeightedGame.getWinChancePercent(config, index),
        ),
        multiplier: multipliers.map((_, index) => WeightedGame.getMultiplier(config, index)),
        formattedMultiplier: multipliers.map((_, index) =>
          WeightedGame.getFormattedMultiplier(config, index),
        ),
        netMultiplier: houseEdge
          ? multipliers.map((_, index) =>
              getNetMultiplier(WeightedGame.getMultiplier(config, index), houseEdge),
            )
          : undefined,
        formattedNetMultiplier: houseEdge
          ? multipliers.map((_, index) =>
              getFormattedNetMultiplier(WeightedGame.getMultiplier(config, index), houseEdge),
            )
          : undefined,
      };
    });
  }

  // Weighted game utilies
  static getWeightedGameConfigLabel(
    configId: WeightedGameConfigId,
    chainId: CasinoChainId,
    customWeightedGameConfigs?: WeightedGameConfiguration[],
  ): string {
    const existingCachedConfig = weightedGameCachedConfigurations[chainId].find(
      (c) => c.configId === configId,
    );
    const existingCustomConfig = customWeightedGameConfigs?.find((c) => c.configId === configId);
    return existingCachedConfig?.label ?? existingCustomConfig?.label ?? `Config #${configId}`;
  }
}
