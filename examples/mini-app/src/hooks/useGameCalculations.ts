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
  multiplier: string
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
