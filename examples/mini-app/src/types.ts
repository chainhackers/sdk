import { COINTOSS_FACE } from "@betswirl/sdk-core"

export interface GameResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: COINTOSS_FACE
}

export type BetStatus = "pending" | "success" | "error"
