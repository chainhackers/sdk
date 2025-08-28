import { CASINO_GAME_TYPE, type WEIGHTED_CASINO_GAME_TYPE } from "../../data/casino";
import type { BP } from "../../interfaces";
import type {
  CoinTossChoiceInput,
  DiceChoiceInput,
  KenoChoiceInput,
  RouletteChoiceInput,
} from "..";

type MayBeMultiOutputsValue<T extends CASINO_GAME_TYPE> = T extends
  | CASINO_GAME_TYPE.KENO
  | WEIGHTED_CASINO_GAME_TYPE
  ? number[]
  : number;

export interface ChoiceInput<T extends CASINO_GAME_TYPE = CASINO_GAME_TYPE> {
  game: CASINO_GAME_TYPE;
  label: string;
  winChancePercent: MayBeMultiOutputsValue<T>;
  multiplier: MayBeMultiOutputsValue<T>;
  formattedMultiplier: MayBeMultiOutputsValue<T>;
  netMultiplier?: MayBeMultiOutputsValue<T>;
  formattedNetMultiplier?: MayBeMultiOutputsValue<T>;
}

// Game should not know the game implementation details, but well..  it helps developers
export type NormalGameChoiceInput =
  | CoinTossChoiceInput
  | DiceChoiceInput
  | RouletteChoiceInput
  | KenoChoiceInput;

export abstract class AbstractCasinoGame<TInput, TEncodedInput, TRolled, TEncodedRolled> {
  getWinChancePercent(_input: TInput | string): number {
    throw new Error("Not implemented");
  }
  encodeInput(_input: TInput | string): TEncodedInput {
    throw new Error("Not implemented");
  }
  encodeAbiParametersInput(_input: TInput | string): TEncodedInput {
    throw new Error("Not implemented");
  }
  decodeInput(_encodedInput: TEncodedInput | string): TInput {
    throw new Error("Not implemented");
  }
  getMultiplier(_input: TInput | string): BP {
    throw new Error("Not implemented");
  }
  getFormattedMultiplier(_input: TInput | string): number {
    throw new Error("Not implemented");
  }
  decodeRolled(_encodedRolledInput: TEncodedRolled | string): TRolled {
    throw new Error("Not implemented");
  }
}
