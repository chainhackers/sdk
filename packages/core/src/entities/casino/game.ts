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
  getMultiplier(_input: TInput | string): bigint {
    throw new Error("Not implemented");
  }
  decodeRolled(
    _encodedRolledInput: TEncodedRolledInput | string
  ): TRolledInput {
    throw new Error("Not implemented");
  }
}
