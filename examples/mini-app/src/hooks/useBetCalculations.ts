import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  CoinToss,
  Dice,
  DiceNumber,
  Roulette,
  RouletteNumber,
  getPayoutDetails,
} from "@betswirl/sdk-core"
import { useMemo } from "react"

type GameSelection = COINTOSS_FACE | DiceNumber | RouletteNumber[]

interface UseBetCalculationsProps<T extends GameSelection> {
  gameType: CASINO_GAME_TYPE
  selection: T
  houseEdge: number
  betAmount: bigint | undefined
  betCount: number | undefined
}

interface UseBetCalculationsResult {
  houseEdge: number
  totalBetAmount: bigint
  grossMultiplier: number
  netMultiplier: number
  grossPayout: bigint
  netPayout: bigint
  betSwirlFees: bigint
  formattedNetMultiplier: number
}

function getMultiplierForGame<T extends GameSelection>(
  gameType: CASINO_GAME_TYPE,
  selection: T,
): number {
  switch (gameType) {
    case CASINO_GAME_TYPE.COINTOSS:
      return CoinToss.getMultiplier(selection as COINTOSS_FACE)
    case CASINO_GAME_TYPE.DICE:
      return Dice.getMultiplier(selection as DiceNumber)
    case CASINO_GAME_TYPE.ROULETTE:
      return Roulette.getMultiplier(selection as RouletteNumber[])
    default:
      throw new Error(`Unsupported game type: ${gameType}`)
  }
}

/**
 * Calculates payout amounts and multipliers for a bet on a casino game.
 * House edge represents the mathematical advantage the casino has over players.
 *
 * @param gameType - Type of casino game being played
 * @param selection - Player's choice (coin face or dice number)
 * @param houseEdge - Casino's edge in basis points (e.g., 100 = 1%)
 * @param betAmount - Amount wagered by the player
 * @param betCount - Number of bets to be placed
 * @returns Payout calculations including multipliers and target payout
 *
 * @example
 * ```ts
 * const { targetPayoutAmount, multiplier } = useBetCalculations({
 *   gameType: CASINO_GAME_TYPE.COINTOSS,
 *   selection: COINTOSS_FACE.HEADS,
 *   houseEdge: 100, // 1% house edge
 *   betAmount: parseEther('1')
 * })
 * ```
 */
export function useBetCalculations<T extends GameSelection>({
  gameType,
  selection,
  houseEdge,
  betAmount,
  betCount = 1,
}: UseBetCalculationsProps<T>): UseBetCalculationsResult {
  const grossMultiplier = useMemo(
    () => getMultiplierForGame(gameType, selection),
    [gameType, selection],
  )
  const totalBetAmount = useMemo(
    () => (betAmount && betAmount > 0n ? betAmount * BigInt(betCount) : 0n),
    [betAmount, betCount],
  )

  const {
    grossPayout,
    netPayout,
    betSwirlFees,
    netMultiplier,
    formattedNetMultiplier,
  } = getPayoutDetails(betAmount ?? 0n, betCount, grossMultiplier, houseEdge)

  return {
    houseEdge,
    totalBetAmount,
    grossMultiplier,
    netMultiplier,
    grossPayout,
    netPayout,
    betSwirlFees,
    formattedNetMultiplier,
  }
}
