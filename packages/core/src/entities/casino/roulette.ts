import { BP_VALUE } from "../../constants";
import { CASINO_GAME_TYPE } from "../../data/casino";
import { getFormattedNetMultiplier, getNetMultiplier } from "../../utils/bet";
import { AbstractCasinoGame, type ChoiceInput } from "./game";
export const MIN_SELECTABLE_ROULETTE_NUMBER = 0 as RouletteNumber;
export const MAX_SELECTABLE_ROULETTE_NUMBER = 36 as RouletteNumber;

export type RouletteNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36;
export enum ROULETTE_INPUT_BUNDLE {
  FIRST_ROW = "First row",
  SECOND_ROW = "Second row",
  THIRD_ROW = "Third row",
  ONE_TO_TWELVE = "1 to 12",
  THIRTEEN_TO_TWENTY_FOUR = "13 to 24",
  TWENTY_FIVE_TO_THIRTY_SIX = "25 to 36",
  ONE_TO_EIGHTEEN = "1 to 18",
  EIGHTEEN_TO_THIRTY_SIX = "18 to 36",
  ODD = "Odd",
  EVEN = "Even",
  RED = "Red",
  BLACK = "Black",
}

export interface RouletteChoiceInput extends ChoiceInput<CASINO_GAME_TYPE.ROULETTE> {
  value: RouletteNumber[];
  id: RouletteNumber[] | ROULETTE_INPUT_BUNDLE;
}

export type RouletteEncodedInput = number;
export type RouletteEncodedRolled = number;

export class Roulette extends AbstractCasinoGame<
  RouletteNumber[],
  RouletteEncodedInput,
  RouletteNumber,
  RouletteEncodedRolled
> {
  static getWinChancePercent(numbers: RouletteNumber[]): number {
    const encodedNumbers = Roulette.encodeInput(numbers);
    return (
      Math.round(
        (Roulette.getSelectedNumbersCount(encodedNumbers) / (MAX_SELECTABLE_ROULETTE_NUMBER + 1)) *
          1e3,
      ) / 10
    );
  }

  static getMultiplier(numbers: RouletteNumber[]): number {
    const encodedNumbers = Roulette.encodeInput(numbers);
    return encodedNumbers
      ? Number(
          (BigInt(BP_VALUE) * BigInt(MAX_SELECTABLE_ROULETTE_NUMBER + 1)) /
            BigInt(Roulette.getSelectedNumbersCount(encodedNumbers)),
        )
      : 0;
  }

  static getFormattedMultiplier(numbers: RouletteNumber[]): number {
    return Number((Roulette.getMultiplier(numbers) / BP_VALUE).toFixed(3));
  }

  static encodeInput(numbers: RouletteNumber[]): RouletteEncodedInput {
    // 1. Make the array unique
    const uniqueNumbers = [...new Set(numbers)];
    // 2. Sort the array
    const sortedNumbers = uniqueNumbers.sort((a, b) => a - b);
    // 3. Create a boolean array
    const sortedBooleans: boolean[] = Array(37).fill(false);
    for (const num of sortedNumbers) {
      sortedBooleans[num] = true;
    }
    // 4. Create a binary numbers
    const binaryNumbers = Object.values(sortedBooleans)
      .slice()
      .reverse()
      .reduce((numbers, isActive) => {
        return numbers + (isActive ? 1 : 0);
      }, "");
    // 5. Transform the binary numbers to a number
    return Number.parseInt(binaryNumbers, 2);
  }

  static decodeInput(encodedNumbers: RouletteEncodedInput | string): RouletteNumber[] {
    return Number(encodedNumbers)
      .toString(2)
      .split("")
      .reverse()
      .map((number, i) => (number === "1" ? i : -1))
      .filter((number) => number >= 0) as RouletteNumber[];
  }

  static decodeRolled(encodedRolled: RouletteEncodedRolled | string): RouletteNumber {
    return Number(encodedRolled) as RouletteNumber;
  }

  static getChoiceInputs(houseEdge?: number): RouletteChoiceInput[] {
    const createChoiceInput = (
      numbers: RouletteNumber[],
      id: RouletteNumber[] | ROULETTE_INPUT_BUNDLE,
      label: string,
    ): RouletteChoiceInput => ({
      value: numbers,
      id,
      game: CASINO_GAME_TYPE.ROULETTE,
      label,
      winChancePercent: Roulette.getWinChancePercent(numbers),
      multiplier: Roulette.getMultiplier(numbers),
      formattedMultiplier: Roulette.getFormattedMultiplier(numbers),
      netMultiplier: houseEdge
        ? getNetMultiplier(Roulette.getMultiplier(numbers), houseEdge)
        : undefined,
      formattedNetMultiplier: houseEdge
        ? getFormattedNetMultiplier(Roulette.getMultiplier(numbers), houseEdge)
        : undefined,
    });

    // 1. Single numbers
    const choiceInputs: RouletteChoiceInput[] = Array.from({ length: 37 }, (_, i) => {
      const rouletteNumber = i as RouletteNumber;
      return createChoiceInput([rouletteNumber], [rouletteNumber], `${rouletteNumber}`);
    });

    // 2. Rows
    choiceInputs.push(
      ...[1, 2, 3].map((startNumber) => {
        const rowNumbers = Array.from(
          { length: 12 },
          (_, i) => startNumber + i * 3,
        ) as RouletteNumber[];
        const bundle =
          startNumber === 1
            ? ROULETTE_INPUT_BUNDLE.FIRST_ROW
            : startNumber === 2
              ? ROULETTE_INPUT_BUNDLE.SECOND_ROW
              : ROULETTE_INPUT_BUNDLE.THIRD_ROW;
        return createChoiceInput(rowNumbers, bundle, `${bundle} (${rowNumbers})`);
      }),
    );

    // 3. From to
    const fromToBundles = [
      {
        from: 1,
        to: 12,
        id: ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE,
      },
      {
        from: 13,
        to: 24,
        id: ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR,
      },
      {
        from: 25,
        to: 36,
        id: ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX,
      },
      {
        from: 1,
        to: 18,
        id: ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN,
      },
      {
        from: 19,
        to: 36,
        id: ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX,
      },
    ];
    choiceInputs.push(
      ...fromToBundles.map((bundle) => {
        const numbers = Array.from(
          { length: bundle.to - bundle.from + 1 },
          (_, i) => bundle.from + i,
        ) as RouletteNumber[];
        return createChoiceInput(numbers, bundle.id, `${bundle.id}`);
      }),
    );

    // 4. Odd and even
    choiceInputs.push(
      ...[1, 2].map((startNumber) => {
        const rowNumbers = Array.from(
          { length: 18 },
          (_, i) => startNumber + i * 2,
        ) as RouletteNumber[];
        const bundle = startNumber === 1 ? ROULETTE_INPUT_BUNDLE.ODD : ROULETTE_INPUT_BUNDLE.EVEN;
        return createChoiceInput(rowNumbers, bundle, `${bundle} (${rowNumbers})`);
      }),
    );

    // 5. Colors
    const colorBundles = [
      {
        id: ROULETTE_INPUT_BUNDLE.BLACK,
        numbers: [
          2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
        ] as RouletteNumber[],
      },
      {
        id: ROULETTE_INPUT_BUNDLE.RED,
        numbers: [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ] as RouletteNumber[],
      },
    ];
    choiceInputs.push(
      ...colorBundles.map((colorBundle) =>
        createChoiceInput(colorBundle.numbers, colorBundle.id, `${colorBundle.id}`),
      ),
    );
    return choiceInputs;
  }

  // Roulette utilities
  static getSelectedNumbersCount(encodedNumbers: number) {
    return (Number(encodedNumbers).toString(2).match(/1/g) || []).length;
  }

  static combineChoiceInputs(
    inputs: RouletteChoiceInput[],
    houseEdge?: number,
  ): RouletteChoiceInput {
    // 1. Combine all unique numbers from the inputs
    const combinedNumbers = [...new Set(inputs.flatMap((input) => input.value))];
    // 2. Sort the numbers
    const sortedCombinedNumbers = combinedNumbers.sort((a, b) => a - b);

    // 3. Create a the custom label
    const customLabel = sortedCombinedNumbers.map((rouletteNumber) => rouletteNumber).join(" & ");

    return {
      value: sortedCombinedNumbers,
      id: sortedCombinedNumbers,
      game: CASINO_GAME_TYPE.ROULETTE,
      label: customLabel,
      winChancePercent: Roulette.getWinChancePercent(combinedNumbers),
      multiplier: Roulette.getMultiplier(combinedNumbers),
      formattedMultiplier: Roulette.getFormattedMultiplier(combinedNumbers),
      netMultiplier: houseEdge
        ? getNetMultiplier(Roulette.getMultiplier(combinedNumbers), houseEdge)
        : undefined,
      formattedNetMultiplier: houseEdge
        ? getFormattedNetMultiplier(Roulette.getMultiplier(combinedNumbers), houseEdge)
        : undefined,
    };
  }
}
