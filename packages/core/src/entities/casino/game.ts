import { CASINO_GAME_TYPE } from "../../data/casino";

export interface ChoiceInput {
  game: CASINO_GAME_TYPE;
  label: string;
  winChancePercent: number;
  multiplier: number;
  formattedMultiplier: number;
  netMultiplier?: number;
  formattedNetMultiplier?: number;
}

export abstract class AbstractCasinoGame<
  TInput,
  TEncodedInput,
  TRolledInput,
  TEncodedRolledInput
> {
  getWinChancePercent(_input: TInput | string): number {
    throw new Error("Not implemented");
  }
  encodeInput(_input: TInput | string): TEncodedInput {
    throw new Error("Not implemented");
  }
  decodeInput(_encodedInput: TEncodedInput | string): TInput {
    throw new Error("Not implemented");
  }
  getMultiplier(_input: TInput | string): number {
    throw new Error("Not implemented");
  }
  getFormattedMultiplier(_input: TInput | string): number {
    throw new Error("Not implemented");
  }
  decodeRolled(
    _encodedRolledInput: TEncodedRolledInput | string
  ): TRolledInput {
    throw new Error("Not implemented");
  }
}
