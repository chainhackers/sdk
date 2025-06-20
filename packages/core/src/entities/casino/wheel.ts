import { generateRandomHexColor, getNetMultiplier, type WeightedGameConfiguration } from "../..";
import { WeightedGame, type WeightedGameChoiceInput } from "./weightedGame";

export interface WheelChoiceInput extends WeightedGameChoiceInput {}

export class Wheel extends WeightedGame {
  // Wheel utilities

  /**
   * Computes and returns the list of unique wheel outputs for a given weighted game configuration.
   * It is particularly useful to display all the unique possible outputs above/below the wheel in the UI.
   *
   * This function groups wheel segments that have the same net multiplier (netMultiplier),
   * sums their weights, and returns for each unique multiplier:
   *   - the net multiplier (rounded to 2 decimals)
   *   - the raw multiplier (before house edge)
   *   - the chance to win this multiplier (as a percentage)
   *   - the color associated with this segment (or a randomly generated color if not provided)
   *
   * @param weightedGameConfig The wheel configuration (weights, multipliers, colors, etc.)
   * @param houseEdge The house edge to apply for net multiplier calculation
   * @returns An array of objects representing each unique wheel output:
   *   - multiplier: the net multiplier (rounded to 2 decimals)
   *   - rawMultiplier: the raw multiplier (before house edge)
   *   - chanceToWin: the probability of landing on this multiplier (in %)
   *   - color: the color associated with this segment
   *
   * @example
   * const outputs = Wheel.getUniqueWheelOutputs(config, 200);
   * // [
   * //   { multiplier: 1.95, rawMultiplier: 19500, chanceToWin: 10.5, color: "#29384C" },
   * //   ...
   * // ]
   */
  static getUniqueWheelOutputs(
    weightedGameConfig: WeightedGameConfiguration,
    houseEdge: number,
  ): {
    multiplier: number;
    rawMultiplier: number;
    chanceToWin: number;
    color: string;
  }[] {
    const uniqueMultipliers = new Map<number, { color: string; weight: bigint }>();
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n);
    weightedGameConfig.multipliers.forEach((_, index) => {
      const netMultiplier = getNetMultiplier(
        WeightedGame.getMultiplier(weightedGameConfig, index),
        houseEdge,
      );
      if (!uniqueMultipliers.has(netMultiplier)) {
        uniqueMultipliers.set(netMultiplier, {
          color: weightedGameConfig.colors?.[index] || generateRandomHexColor(),
          weight: weightedGameConfig.weights[index]!,
        });
      } else {
        uniqueMultipliers.get(netMultiplier)!.weight =
          uniqueMultipliers.get(netMultiplier)!.weight + weightedGameConfig.weights[index]!;
      }
    });

    return Array.from(uniqueMultipliers.entries()).map(([multiplier, config]) => ({
      multiplier: Number(multiplier.toFixed(2)),
      rawMultiplier: multiplier,
      chanceToWin: Number(((Number(config.weight) / Number(totalWeight)) * 100).toFixed(2)),
      color: config.color,
    }));
  }
}
