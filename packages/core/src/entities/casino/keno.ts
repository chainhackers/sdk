import { BP_VALUE } from "../../constants";
import type { KenoConfiguration } from "../../read/casino/keno";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

type KenoBall =  1
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
| 40
export interface KenoChoiceInput extends ChoiceInput {
    value: KenoBall[];
    id: KenoBall[]
  }
  
  export type KenoEncodedInput = number;
  export type KenoEncodedRolled = bigint[];
  
export class Keno extends AbstractCasinoGame<
KenoBall[],
    KenoEncodedInput,
    KenoBall[],
    KenoEncodedRolled[]
> {
    static getWinChancePercent(kenoConfig: KenoConfiguration, selectedBallsCount: number, matchedBallsCount: number): number {
        const multiplier = Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedBallsCount)
        if (!multiplier) return 0;

        return (1 / multiplier / (selectedBallsCount + 1)) * BP_VALUE * 100;
    }
  
    static getMultiplier(kenoConfig: KenoConfiguration, selectedBallsCount: number, matchedBallsCount: number): number {
        return kenoConfig.mutliplierTable[selectedBallsCount]?.[matchedBallsCount] || 0;
    }
  
    static getFormattedMultiplier(kenoConfig: KenoConfiguration, selectedBallsCount: number, matchedBallsCount: number): number {
        return Number((Keno.getMultiplier(kenoConfig, selectedBallsCount, matchedBallsCount) / BP_VALUE).toFixed(3));
    }
  
    static encodeInput(balls: KenoBall[], kenoConfig: KenoConfiguration): KenoEncodedInput {
        // 1. Make the array unique
        const uniqueNumbers = [...new Set(balls)];
        // 2. Sort the array
        const sortedNumbers = uniqueNumbers.sort((a, b) => a - b);
        // 3. Create a boolean array
        const sortedBooleans: boolean[] = Array(kenoConfig.biggestSelectableBall).fill(false);
        sortedNumbers.forEach((num) => {
            sortedBooleans[num] = true;
        });
        // 4. Create a binary numbers
        const binaryNumbers = Object.values(sortedBooleans)
            .slice()
            .reverse()
            .reduce((numbers, isActive) => {
                return numbers + (isActive ? 1 : 0);
            }, "");
        // 5. Transform the binary numbers to a number
        return parseInt(binaryNumbers, 2);
    }
  
    static decodeInput(
        encodedBalls: KenoEncodedInput | string
    ): KenoBall[] {
        return  Keno.maskToBalls(Number(encodedBalls))
    }
  
    static decodeRolled(
        encodedRolled: KenoEncodedRolled | string
    ): KenoBall[] {
        return Keno.maskToBalls(Number(encodedRolled)) ;
    }

    static maskToBalls(encodedBalls: number) {
        return encodedBalls
          .toString(2)
          .split("")
          .reverse()
          .map((ball, i) => (ball === "1" ? i + 1 : 0))
          .filter((ball) => ball) as KenoBall[];
      }

}