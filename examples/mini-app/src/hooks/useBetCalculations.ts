import { CASINO_GAME_TYPE, CasinoChainId, CoinToss, Dice, Keno, Roulette, Token, chainById, chainNativeCurrencyToToken, getPayoutDetails } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { GameChoice } from "../types/types"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"

interface UseBetCalculationsProps {
  selection: GameChoice
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

function getMultiplierForGame(selection: GameChoice, token: Token, appChainId: CasinoChainId): number {
  switch (selection.game) {
    case CASINO_GAME_TYPE.COINTOSS:
      return CoinToss.getMultiplier(selection.choice)
    case CASINO_GAME_TYPE.DICE:
      return Dice.getMultiplier(selection.choice)
    case CASINO_GAME_TYPE.ROULETTE:
      return Roulette.getMultiplier(selection.choice)
    case CASINO_GAME_TYPE.KENO: {
      const selectedCount = selection.choice.length
      if (selectedCount === 0) return 0
      const kenoConfig = {
        token: token,
        chainId: appChainId,
        biggestSelectableBall: 15,
        maxSelectableBalls: 7,
        mutliplierTable: [],
      }
      return Keno.getMultiplier(kenoConfig, selectedCount, Math.ceil(selectedCount / 2))
    }
    default:
      throw new Error(`Unsupported game type: ${(selection as any).game}`)
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
export function useBetCalculations({
  selection,
  houseEdge,
  betAmount,
  betCount = 1,
}: UseBetCalculationsProps): UseBetCalculationsResult {
  const { bankrollToken } = useBettingConfig()
  const { appChainId } = useChain()
  const token = bankrollToken || chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency)

  const grossMultiplier = useMemo(() => getMultiplierForGame(selection, token, appChainId), [selection, token, appChainId])
  const totalBetAmount = useMemo(
    () => (betAmount && betAmount > 0n ? betAmount * BigInt(betCount) : 0n),
    [betAmount, betCount],
  )

  const { grossPayout, netPayout, betSwirlFees, netMultiplier, formattedNetMultiplier } =
    getPayoutDetails(betAmount ?? 0n, betCount, grossMultiplier, houseEdge)

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
