import type { BP, WeightedGameConfiguration } from "../..";
import { getNetMultiplier } from "../..";
import { generateRandomHexColor } from "../../utils";
import { WeightedGame, type WeightedGameChoiceInput } from "./weightedGame";

export interface PlinkoChoiceInput extends WeightedGameChoiceInput {}

export class Plinko extends WeightedGame {
  // Plinko utilities

  /**
   * Generates a bell-shaped sorted list of Plinko game segments from the provided configuration.
   *
   * This function takes all entries from the weighted game configuration without deduplication,
   * computes the effective multiplier (after applying the house edge), and sorts the segments
   * such that the entry with the highest weight appears in the center. Lighter weights are
   * symmetrically positioned toward the edges, creating a "bell curve" effect in the layout.
   *
   * @param weightedGameConfig - The full game configuration including multipliers, weights, and optional colors.
   * @param houseEdge - The house edge to apply to each raw multiplier.
   *
   * @returns An array of game segments sorted in a bell-shaped order, where each segment contains:
   *   - multiplier: the raw multiplier (before house edge, BP)
   *   - formattedMultiplier: the raw multiplier formatted (rounded to 3 decimals)
   *   - netMultiplier: the net multiplier (after house edge, BP)
   *   - formattedNetMultiplier: the net multiplier formatted (rounded to 3 decimals)
   *   - chanceToWin: the probability of landing on this multiplier (in %)
   *   - color: the color associated with this segment
   */
  static getSortedPlinkoOutputs(
    weightedGameConfig: WeightedGameConfiguration,
    houseEdge: number,
  ): {
    multiplier: BP;
    formattedMultiplier: number;
    netMultiplier: BP;
    formattedNetMultiplier: number;
    chanceToWin: number;
    color: string;
  }[] {
    const totalWeight = weightedGameConfig.weights.reduce((acc, curr) => acc + curr, 0n);

    const entries = weightedGameConfig.multipliers.map((_, index) => {
      const multiplier = WeightedGame.getMultiplier(weightedGameConfig, index);

      const weight = weightedGameConfig.weights[index]!;
      const color = weightedGameConfig.colors?.[index] || generateRandomHexColor();

      return {
        multiplier: multiplier,
        formattedMultiplier: WeightedGame._formatMultiplier(multiplier),
        netMultiplier: getNetMultiplier(multiplier, houseEdge),
        formattedNetMultiplier: WeightedGame._formatMultiplier(
          getNetMultiplier(multiplier, houseEdge),
        ),
        chanceToWin: Number(((Number(weight) / Number(totalWeight)) * 100).toFixed(2)),
        color,
        weight,
      };
    });

    // Sort by weight DESC
    const sortedByWeight = entries.sort((a, b) => Number(b.weight - a.weight));

    // Bell shape arrangement (centre = heaviest weight)
    const bellShapedOrder: typeof entries = [];
    sortedByWeight.forEach((item, index) => {
      if (index % 2 === 0) {
        bellShapedOrder.push(item); // right
      } else {
        bellShapedOrder.unshift(item); // left
      }
    });

    return bellShapedOrder;
  }
}
