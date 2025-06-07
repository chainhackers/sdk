import { type EncodeAbiParametersReturnType, encodeAbiParameters, parseAbiParameters } from "viem";
import { BP_VALUE } from "../../constants";
import { CASINO_GAME_TYPE } from "../../data/casino";
import { getFormattedNetMultiplier, getNetMultiplier } from "../../utils/bet";
import { AbstractCasinoGame, type ChoiceInput } from "./game";

export enum COINTOSS_FACE {
  TAILS = "TAILS",
  HEADS = "HEADS",
}

export interface CoinTossChoiceInput extends ChoiceInput<CASINO_GAME_TYPE.COINTOSS> {
  value: COINTOSS_FACE;
  id: COINTOSS_FACE;
}

export type CoinTossEncodedInput = boolean;
export type CoinTossEncodedRolled = boolean;

export class CoinToss extends AbstractCasinoGame<
  COINTOSS_FACE,
  CoinTossEncodedInput,
  COINTOSS_FACE,
  CoinTossEncodedRolled
> {
  static getWinChancePercent(_face: COINTOSS_FACE | string): number {
    return 50;
  }

  static getMultiplier(_face: COINTOSS_FACE | string): number {
    return 20000;
  }

  static getFormattedMultiplier(_face: COINTOSS_FACE | string): number {
    return Number((CoinToss.getMultiplier(_face) / BP_VALUE).toFixed(3));
  }

  static encodeInput(face: COINTOSS_FACE | string): CoinTossEncodedInput {
    return face === COINTOSS_FACE.HEADS || face.toLowerCase() === "true" || face === "1";
  }

  static encodeAbiParametersInput(face: COINTOSS_FACE | string): EncodeAbiParametersReturnType {
    return encodeAbiParameters(parseAbiParameters("bool"), [CoinToss.encodeInput(face)]);
  }

  static decodeInput(encodedFace: CoinTossEncodedInput | string): COINTOSS_FACE {
    if (typeof encodedFace === "string") {
      const normalizedValue = encodedFace.toLowerCase();
      return normalizedValue === "true" || normalizedValue === "1"
        ? COINTOSS_FACE.HEADS
        : COINTOSS_FACE.TAILS;
    }
    return encodedFace ? COINTOSS_FACE.HEADS : COINTOSS_FACE.TAILS;
  }

  static decodeRolled(encodedFace: CoinTossEncodedRolled | string): COINTOSS_FACE {
    return CoinToss.decodeInput(encodedFace);
  }
  // houseEdge is a number between 0 and 10000
  static getChoiceInputs(houseEdge?: number): CoinTossChoiceInput[] {
    const multiplier = CoinToss.getMultiplier(COINTOSS_FACE.TAILS);
    const formattedMultiplier = CoinToss.getFormattedMultiplier(COINTOSS_FACE.TAILS);
    const netMultiplier = houseEdge ? getNetMultiplier(multiplier, houseEdge) : undefined;
    const formattedNetMultiplier = houseEdge
      ? getFormattedNetMultiplier(multiplier, houseEdge)
      : undefined;

    return [
      {
        value: COINTOSS_FACE.TAILS,
        id: COINTOSS_FACE.TAILS,
        game: CASINO_GAME_TYPE.COINTOSS,
        label: "Tails",
        winChancePercent: CoinToss.getWinChancePercent(COINTOSS_FACE.TAILS),
        multiplier: CoinToss.getMultiplier(COINTOSS_FACE.TAILS),
        formattedMultiplier,
        netMultiplier,
        formattedNetMultiplier,
      },
      {
        value: COINTOSS_FACE.HEADS,
        id: COINTOSS_FACE.HEADS,
        game: CASINO_GAME_TYPE.COINTOSS,
        label: "Heads",
        winChancePercent: CoinToss.getWinChancePercent(COINTOSS_FACE.HEADS),
        multiplier: multiplier,
        formattedMultiplier,
        netMultiplier,
        formattedNetMultiplier,
      },
    ];
  }
}
