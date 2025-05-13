import { BP_VALUE } from "../../constants";
import { CASINO_GAME_TYPE } from "../../data/casino";
import { getFormattedNetMultiplier, getNetMultiplier } from "../../utils/bet";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

export const MIN_SELECTABLE_DICE_NUMBER = 1 as DiceNumber;
export const MAX_SELECTABLE_DICE_NUMBER = 99 as DiceNumber;

export type DiceNumber =
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
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60
  | 61
  | 62
  | 63
  | 64
  | 65
  | 66
  | 67
  | 68
  | 69
  | 70
  | 71
  | 72
  | 73
  | 74
  | 75
  | 76
  | 77
  | 78
  | 79
  | 80
  | 81
  | 82
  | 83
  | 84
  | 85
  | 86
  | 87
  | 88
  | 89
  | 90
  | 91
  | 92
  | 93
  | 94
  | 95
  | 96
  | 97
  | 98
  | 99;

export type DiceRolledNumber = 100 & DiceNumber;

export interface DiceChoiceInput extends ChoiceInput<CASINO_GAME_TYPE.DICE> {
  value: DiceNumber;
  id: DiceNumber;
}

export type DiceEncodedInput = number;
export type DiceEncodedRolled = number;

export class Dice extends AbstractCasinoGame<
  DiceNumber,
  DiceEncodedInput,
  DiceRolledNumber,
  DiceEncodedRolled
> {
  static getWinChancePercent(cap: DiceNumber | string): number {
    return Math.max(100 - Number(cap), 1);
  }

  static getMultiplier(cap: DiceNumber | string): number {
    return Math.round((BP_VALUE * 100) / (100 - Number(cap)));
  }

  static getFormattedMultiplier(cap: DiceNumber | string): number {
    return Number((Dice.getMultiplier(cap) / BP_VALUE).toFixed(3));
  }

  static encodeInput(cap: DiceNumber | string): DiceEncodedInput {
    return Number(cap) as DiceEncodedInput;
  }

  static decodeInput(encodedCap: DiceEncodedInput | string): DiceNumber {
    return Number(encodedCap) as DiceNumber;
  }

  static decodeRolled(encodedCap: DiceEncodedRolled | string): DiceRolledNumber {
    return Number(encodedCap) as DiceRolledNumber;
  }

  static getChoiceInputs(houseEdge?: number): DiceChoiceInput[] {
    return Array.from({ length: 99 }, (_, i) => {
      const diceNumber = (i + 1) as DiceNumber;
      return {
        value: diceNumber,
        id: diceNumber,
        game: CASINO_GAME_TYPE.DICE,
        label: `${diceNumber}`,
        winChancePercent: Dice.getWinChancePercent(diceNumber),
        multiplier: Dice.getMultiplier(diceNumber),
        formattedMultiplier: Dice.getFormattedMultiplier(diceNumber),
        netMultiplier: houseEdge
          ? getNetMultiplier(Dice.getMultiplier(diceNumber), houseEdge)
          : undefined,
        formattedNetMultiplier: houseEdge
          ? getFormattedNetMultiplier(Dice.getMultiplier(diceNumber), houseEdge)
          : undefined,
      };
    });
  }
}
