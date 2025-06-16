import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  CoinTossEncodedInput,
  DiceEncodedInput,
  DiceNumber,
  RouletteEncodedInput,
  RouletteNumber,
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

export type GameRolledResult =
  | { game: CASINO_GAME_TYPE.COINTOSS; rolled: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; rolled: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; rolled: RouletteNumber }

export type GameEncodedInput =
  | { game: CASINO_GAME_TYPE.COINTOSS; encodedInput: CoinTossEncodedInput }
  | { game: CASINO_GAME_TYPE.DICE; encodedInput: DiceEncodedInput }
  | { game: CASINO_GAME_TYPE.ROULETTE; encodedInput: RouletteEncodedInput }

export interface GameResult {
  isWin: boolean
  payout: bigint
  currency: string
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
