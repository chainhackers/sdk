import {
  CASINO_GAME_TYPE,
  type CasinoChainId,
  type CasinoRolledBet,
  CasinoToken,
  COINTOSS_FACE,
  CoinTossEncodedInput,
  DiceEncodedInput,
  DiceNumber,
  KenoBall,
  KenoEncodedInput,
  RouletteEncodedInput,
  RouletteNumber,
  type Token,
  type WeightedGameConfiguration,
  type WeightedGameEncodedInput,
} from "@betswirl/sdk-core"
import { type DefaultError, type QueryKey, type UseQueryOptions } from "@tanstack/react-query"

export type Theme = "light" | "dark" | "system"

export const THEME_OPTIONS: Theme[] = ["light", "dark", "system"]

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
  | { game: CASINO_GAME_TYPE.WHEEL; choice: WeightedGameConfiguration }

export type GameRolledResult =
  | { game: CASINO_GAME_TYPE.COINTOSS; rolled: COINTOSS_FACE }
  | { game: CASINO_GAME_TYPE.DICE; rolled: DiceNumber }
  | { game: CASINO_GAME_TYPE.ROULETTE; rolled: RouletteNumber }
  | { game: CASINO_GAME_TYPE.KENO; rolled: KenoBall[] }
  | { game: CASINO_GAME_TYPE.WHEEL; rolled: number }

export type GameEncodedInput =
  | { game: CASINO_GAME_TYPE.COINTOSS; encodedInput: CoinTossEncodedInput }
  | { game: CASINO_GAME_TYPE.DICE; encodedInput: DiceEncodedInput }
  | { game: CASINO_GAME_TYPE.ROULETTE; encodedInput: RouletteEncodedInput }
  | { game: CASINO_GAME_TYPE.KENO; encodedInput: KenoEncodedInput }
  | { game: CASINO_GAME_TYPE.WHEEL; encodedInput: WeightedGameEncodedInput }

export type GameResult = CasinoRolledBet & {
  rolled: GameRolledResult
  formattedRolled: string
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

export interface CasinoTokenWithImage extends CasinoToken {
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
  payoutCurrencyToken: TokenWithImage
  timestamp: string
}

export type ChainTokenPanelView = "main" | "chain" | "token"

export interface GameDefinition<T extends GameChoice> {
  gameType: T["game"]
  defaultSelection: T
  getMultiplier: (choice: T["choice"]) => number
  encodeInput: (choice: T["choice"]) => GameEncodedInput["encodedInput"]
  getWinChancePercent?: (choice: T["choice"]) => number | number[]
  formatDisplayResult: (rolled: GameRolledResult, choice: T["choice"]) => string
}

// Leaderboard types
export type LeaderboardStatus = "ongoing" | "ended"

export type LeaderboardBadgeStatus = "pending" | "expired"

export type LeaderboardUserAction =
  | { type: "play" }
  | { type: "overview" }
  | { type: "claim"; amount: string; tokenSymbol: string }
  | { type: "none" }

export interface LeaderboardPrize {
  token: TokenWithImage
  amount: string
}

export interface LeaderboardItem {
  id: string
  rank: number
  title: string
  chainId: CasinoChainId
  startDate: string // ISO 8601 format
  endDate: string // ISO 8601 format
  status: LeaderboardStatus
  badgeStatus?: LeaderboardBadgeStatus
  prize: LeaderboardPrize
  participants: number
  isPartner: boolean
  userAction: LeaderboardUserAction
}

// Additional types for detailed leaderboard overview view
export interface LeaderboardUserStats {
  status: "Finalized" | "Ongoing" | "Claimable"
  position: number
  points: number
  prize: {
    amount: string
    tokenSymbol: string
    tokenIconUrl?: string
  }
  contractAddress: string
}

export interface LeaderboardRule {
  text: string
  isHighlighted?: boolean
}

export interface LeaderboardOverviewData extends LeaderboardItem {
  userStats: LeaderboardUserStats
  rules: LeaderboardRule[]
  isExpired: boolean
}

// Types for ranking tab
export interface RankingEntry {
  rank: number
  playerAddress: string
  points: number
  rewardAmount: string
  rewardToken: TokenWithImage
}
