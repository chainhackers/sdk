import { AbstractCasinoGame } from "./game.ts";

export class Dice extends AbstractCasinoGame<number, number, number, number> {
  static getWinChancePercent(cap: number | string): number {
    return 100 - Number(cap);
  }

  static encodeInput(cap: number | string): number {
    return Number(cap);
  }

  static decodeInput(encodedCap: number | string): number {
    return Number(encodedCap);
  }

  static decodeRolled(encodedCap: number | string): number {
    return this.decodeInput(encodedCap);
  }
}
