import { AbstractCasinoGame } from "./game";

export enum COINTOSS_FACE {
  TAILS = 1,
  HEADS = 0,
}

export class CoinToss extends AbstractCasinoGame<
  COINTOSS_FACE,
  boolean,
  COINTOSS_FACE,
  boolean
> {
  static getWinChancePercent(_face: COINTOSS_FACE | string): number {
    return 50;
  }

  static getMultiplier(_face: COINTOSS_FACE | string): bigint {
    return BigInt(20000);
  }

  static encodeInput(face: COINTOSS_FACE | string): boolean {
    if (typeof face === "string") {
      return face.toLowerCase() === "true" || face === "1";
    }
    return Boolean(face);
  }

  static decodeInput(encodedFace: boolean | string): COINTOSS_FACE {
    if (typeof encodedFace === "string") {
      const normalizedValue = encodedFace.toLowerCase();
      return normalizedValue === "true" || normalizedValue === "1"
        ? COINTOSS_FACE.HEADS
        : COINTOSS_FACE.TAILS;
    }
    return encodedFace ? COINTOSS_FACE.HEADS : COINTOSS_FACE.TAILS;
  }

  static decodeRolled(encodedFace: boolean | string): COINTOSS_FACE {
    return this.decodeInput(encodedFace);
  }
}
