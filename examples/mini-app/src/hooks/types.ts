import type { Abi, Hex } from "viem"
import type {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  DiceNumber,
} from "@betswirl/sdk-core"

export interface CoinTossGameResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: COINTOSS_FACE
}

export interface DiceGameResult {
  isWin: boolean
  payout: bigint
  currency: string
  rolled: DiceNumber
}

export interface WatchTarget {
  betId: bigint
  contractAddress: Hex
  gameType: CASINO_GAME_TYPE
  eventAbi: Abi
  eventName: string
  eventArgs: { id: bigint }
}
