import { CASINO_GAME_TYPE, COINTOSS_FACE, CoinToss, Dice, DiceNumber } from "@betswirl/sdk-core"
import { useMemo } from "react"
import {
  GameCalculationParams,
  calculateTargetPayout,
  formatMultiplier,
} from "../lib/gameCalculations"

type GameSelection = COINTOSS_FACE | DiceNumber

interface UseGameCalculationsProps<T extends GameSelection> {
  gameType: CASINO_GAME_TYPE
  selection: T
  houseEdge: number
  betAmount: bigint | undefined
}

interface UseGameCalculationsResult {
  gameCalculationParams: GameCalculationParams
  targetPayoutAmount: bigint
  multiplier: number
  grossMultiplier: number
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
    default:
      throw new Error(`Unsupported game type: ${gameType}`)
  }
}

/**
 * Calculates payout amounts and multipliers for casino games.
 * House edge represents the mathematical advantage the casino has over players.
 *
 * @param gameType - Type of casino game being played
 * @param selection - Player's choice (coin face or dice number)
 * @param houseEdge - Casino's edge in basis points (e.g., 100 = 1%)
 * @param betAmount - Amount wagered by the player
 * @returns Payout calculations including multipliers and target payout
 *
 * @example
 * ```ts
 * const { targetPayoutAmount, multiplier } = useGameCalculations({
 *   gameType: CASINO_GAME_TYPE.COINTOSS,
 *   selection: COINTOSS_FACE.HEADS,
 *   houseEdge: 100, // 1% house edge
 *   betAmount: parseEther('1')
 * })
 * ```
 */
export function useGameCalculations<T extends GameSelection>({
  gameType,
  selection,
  houseEdge,
  betAmount,
}: UseGameCalculationsProps<T>): UseGameCalculationsResult {
  const grossMultiplier = useMemo(
    () => getMultiplierForGame(gameType, selection),
    [gameType, selection],
  )

  const gameCalculationParams = useMemo(
    () => ({
      houseEdge,
      grossMultiplier,
    }),
    [houseEdge, grossMultiplier],
  )

  const targetPayoutAmount = useMemo(
    () => calculateTargetPayout(betAmount, gameCalculationParams),
    [betAmount, gameCalculationParams],
  )

  const multiplier = useMemo(() => formatMultiplier(gameCalculationParams), [gameCalculationParams])

  return {
    gameCalculationParams,
    targetPayoutAmount,
    multiplier,
    grossMultiplier,
  }
}
