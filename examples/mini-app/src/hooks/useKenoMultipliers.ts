import { Keno, KenoConfiguration, getFormattedNetMultiplier } from "@betswirl/sdk-core"
import { useMemo } from "react"

interface UseKenoMultipliersProps {
  kenoConfig: KenoConfiguration | undefined
  selectedNumbersCount: number
  houseEdge: number
}

interface KenoMultiplierData {
  multiplier: number
  winChance: number
}

interface UseKenoMultipliersResult {
  multipliers: KenoMultiplierData[]
  isLoading: boolean
}

export function useKenoMultipliers({
  kenoConfig,
  selectedNumbersCount,
  houseEdge,
}: UseKenoMultipliersProps): UseKenoMultipliersResult {
  const multipliers = useMemo(() => {
    if (!kenoConfig || selectedNumbersCount === 0) {
      return []
    }

    const rawMultipliers = kenoConfig.multiplierTable[selectedNumbersCount]
    if (!rawMultipliers) {
      return []
    }

    return rawMultipliers
      .map((_, index) => {
        const multiplier = getFormattedNetMultiplier(
          Keno.getMultiplier(kenoConfig, selectedNumbersCount, index),
          houseEdge,
        )
        const winChance = Keno.getWinChancePercent(kenoConfig, selectedNumbersCount, index)

        return {
          multiplier,
          winChance,
        }
      })
      .reverse()
  }, [kenoConfig, selectedNumbersCount, houseEdge])

  return {
    multipliers,
    isLoading: !kenoConfig,
  }
}
