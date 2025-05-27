import { COINTOSS_FACE, DiceNumber } from "@betswirl/sdk-core"

export interface CoinTossResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: COINTOSS_FACE
}

export interface DiceResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: DiceNumber
}

export type BetStatus = "pending" | "success" | "error"
