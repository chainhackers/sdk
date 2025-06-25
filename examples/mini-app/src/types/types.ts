import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  type CasinoRolledBet,
  CoinTossEncodedInput,
  DiceEncodedInput,
  DiceNumber,
  KenoBall,
  KenoEncodedInput,
  RouletteEncodedInput,
  RouletteNumber,
  type Token,
} from "@betswirl/sdk-core"
import { type DefaultError, type QueryKey, type UseQueryOptions } from "@tanstack/react-query"

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> =
  | Omit<
      UseQueryOptions<queryFnData, error, data, queryKey>,
      "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError" | "select"
    >
  | undefined

export type GameChoice =
  | { game: CASINO_GAME_TYPE.COINTOSS; choice: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; choice: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; choice: RouletteNumber[] }
  | { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }

export type GameRolledResult =
  | { game: CASINO_GAME_TYPE.COINTOSS; rolled: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; rolled: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; rolled: RouletteNumber }
  | { game: CASINO_GAME_TYPE.KENO; rolled: KenoBall[] }

export type GameEncodedInput =
  | { game: CASINO_GAME_TYPE.COINTOSS; encodedInput: CoinTossEncodedInput }
  | { game: CASINO_GAME_TYPE.DICE; encodedInput: DiceEncodedInput }
  | { game: CASINO_GAME_TYPE.ROULETTE; encodedInput: RouletteEncodedInput }
  | { game: CASINO_GAME_TYPE.KENO; encodedInput: KenoEncodedInput }

export type GameResult = CasinoRolledBet & {
  rolled: GameRolledResult
}

export type BetStatus =
  | "loading"
  | "pending"
  | "success"
  | "rolling"
  | "error"
  | "waiting-error"
  | "internal-error"
  | null

export interface TokenWithImage extends Token {
  image: string
}

export enum HistoryEntryStatus {
  WonBet = "Won bet",
  Busted = "Busted",
}

export interface HistoryEntry {
  id: string
  status: HistoryEntryStatus
  multiplier: number | string
  payoutAmount: number | string
  payoutCurrencyIcon: React.ReactElement
  timestamp: string
}
