import {
  CASINO_GAME_TYPE,
  CoinTossEncodedInput,
  DiceEncodedInput,
  KenoEncodedInput,
  RouletteEncodedInput,
  WeightedGameEncodedInput,
} from "@betswirl/sdk-core"
import { encodeAbiParameters, parseAbiParameters } from "viem"

export function convertToAbiParameters(game: CASINO_GAME_TYPE, encodedInput: number | boolean) {
  switch (game) {
    case CASINO_GAME_TYPE.COINTOSS:
      return encodeAbiParameters(parseAbiParameters("bool"), [encodedInput as CoinTossEncodedInput])
    case CASINO_GAME_TYPE.DICE:
      return encodeAbiParameters(parseAbiParameters("uint8"), [encodedInput as DiceEncodedInput])
    case CASINO_GAME_TYPE.ROULETTE:
      return encodeAbiParameters(parseAbiParameters("uint40"), [
        encodedInput as RouletteEncodedInput,
      ])
    case CASINO_GAME_TYPE.KENO:
      return encodeAbiParameters(parseAbiParameters("uint40"), [encodedInput as KenoEncodedInput])
    case CASINO_GAME_TYPE.WHEEL:
      return encodeAbiParameters(parseAbiParameters("uint40"), [
        encodedInput as WeightedGameEncodedInput,
      ])
    default:
      return
  }
}
