import { getFormattedNetMultiplier } from "../..";
import { CASINO_GAME_TYPE, getNetMultiplier } from "../..";
import { BP_VALUE } from "../../constants";
import type { KenoConfiguration } from "../../read/casino/keno";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

export type KenoBall =
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
  | 36
  | 37
  | 38
  | 39
  | 40;
export enum KENO_INPUT_BUNDLE {
  MAX_FIRST_NUMBERS = "All last numbers",
  MAX_LAST_NUMBERS = "All first numbers",
  FIRST_AND_LAST = "The first and the last number",
}

export interface KenoChoiceInput extends ChoiceInput<CASINO_GAME_TYPE.KENO> {
  value: KenoBall[];
  config: KenoConfiguration;
  id: KenoBall[] | KENO_INPUT_BUNDLE;
}

export type KenoEncodedInput = number;
export type KenoEncodedRolled = bigint[];

export class Keno extends AbstractCasinoGame<
  KenoBall[],
  KenoEncodedInput,
  KenoBall[],
  KenoEncodedRolled[]
> {
  static getWinChancePercent(
    kenoConfig: KenoConfiguration,
    selectedBallsCount: number,
    matchedBallsCount: number,
  ): number {
    const multiplier = Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedBallsCount);
    if (!multiplier) return 0;

    return (1 / multiplier / (selectedBallsCount + 1)) * BP_VALUE * 100;
  }

  static getMultiplier(
    kenoConfig: KenoConfiguration,
    selectedBallsCount: number,
    matchedBallsCount: number,
  ): number {
    return kenoConfig.mutliplierTable[selectedBallsCount]?.[matchedBallsCount] || 0;
  }

  static getFormattedMultiplier(
    kenoConfig: KenoConfiguration,
    selectedBallsCount: number,
    matchedBallsCount: number,
  ): number {
    return Number(
      (Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedBallsCount) / BP_VALUE).toFixed(3),
    );
  }

  static encodeInput(balls: KenoBall[], kenoConfig: KenoConfiguration): KenoEncodedInput {
    // 1. Make the array unique
    const uniqueNumbers = [...new Set(balls)];
    // 2. Sort the array
    const sortedNumbers = uniqueNumbers.sort((a, b) => a - b);
    // 3. Create a boolean array
    const sortedBooleans: boolean[] = Array(kenoConfig.biggestSelectableBall).fill(false);
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

  static decodeInput(encodedBalls: KenoEncodedInput | string): KenoBall[] {
    return Keno.maskToBalls(Number(encodedBalls));
  }

  static decodeRolled(encodedRolled: KenoEncodedRolled | string): KenoBall[] {
    return Keno.maskToBalls(Number(encodedRolled));
  }

  static getChoiceInputs(kenoConfig: KenoConfiguration, houseEdge?: number): KenoChoiceInput[] {
    const createChoiceInput = (
      balls: KenoBall[],
      id: KenoBall[] | KENO_INPUT_BUNDLE,
      selectedBallsCount: number,
      label: string,
    ): KenoChoiceInput => {
      // eg. selectedBallsCount = 2 => possibleMatchedCounts = [0, 1, 2]
      const possibleMatchedCounts = Array.from({ length: selectedBallsCount + 1 }, (_, i) => i);
      return {
        value: balls,
        config: kenoConfig,
        id,
        game: CASINO_GAME_TYPE.KENO,
        label,
        winChancePercent: possibleMatchedCounts.map((matchedCount) =>
          Keno.getWinChancePercent(kenoConfig, selectedBallsCount, matchedCount),
        ),
        multiplier: possibleMatchedCounts.map((matchedCount) =>
          Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedCount),
        ),
        formattedMultiplier: possibleMatchedCounts.map((matchedCount) =>
          Keno.getFormattedMultiplier(kenoConfig, selectedBallsCount, matchedCount),
        ),
        netMultiplier: houseEdge
          ? possibleMatchedCounts.map((matchedCount) =>
              getNetMultiplier(
                Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedCount),
                houseEdge,
              ),
            )
          : undefined,
        formattedNetMultiplier: houseEdge
          ? possibleMatchedCounts.map((matchedCount) =>
              getFormattedNetMultiplier(
                Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedCount),
                houseEdge,
              ),
            )
          : undefined,
      };
    };

    // 1. Single numbers
    const choiceInputs: KenoChoiceInput[] = Array.from(
      { length: kenoConfig.biggestSelectableBall },
      (_, i) => {
        const kenoBall = (i + 1) as KenoBall;
        return createChoiceInput([kenoBall], [kenoBall], 1, `${kenoBall}`);
      },
    );

    // 2. First one and last one
    if (kenoConfig.maxSelectableBalls > 1 && kenoConfig.biggestSelectableBall > 1) {
      choiceInputs.push(
        createChoiceInput(
          [1, kenoConfig.biggestSelectableBall as KenoBall],
          KENO_INPUT_BUNDLE.FIRST_AND_LAST,
          2,
          `${KENO_INPUT_BUNDLE.FIRST_AND_LAST} (1 & ${kenoConfig.biggestSelectableBall})`,
        ),
      );
    }

    // 3. All first numbers
    const maxFirstNumbers = Array.from(
      { length: kenoConfig.maxSelectableBalls },
      (_, i) => (i + 1) as KenoBall,
    );
    choiceInputs.push(
      createChoiceInput(
        maxFirstNumbers,
        KENO_INPUT_BUNDLE.MAX_FIRST_NUMBERS,
        kenoConfig.maxSelectableBalls,
        `${KENO_INPUT_BUNDLE.MAX_FIRST_NUMBERS} (${maxFirstNumbers.join(", ")})`,
      ),
    );

    // 4. All last numbers
    const maxLastNumbers = Array.from(
      { length: kenoConfig.maxSelectableBalls },
      (_, i) => (kenoConfig.biggestSelectableBall - i) as KenoBall,
    );
    choiceInputs.push(
      createChoiceInput(
        maxLastNumbers,
        KENO_INPUT_BUNDLE.MAX_LAST_NUMBERS,
        kenoConfig.maxSelectableBalls,
        `${KENO_INPUT_BUNDLE.MAX_LAST_NUMBERS} (${maxLastNumbers.join(", ")})`,
      ),
    );

    return choiceInputs;
  }

  // Keno utilities

  static maskToBalls(encodedBalls: number) {
    return encodedBalls
      .toString(2)
      .split("")
      .reverse()
      .map((ball, i) => (ball === "1" ? i + 1 : 0))
      .filter((ball) => ball) as KenoBall[];
  }
}
