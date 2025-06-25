import { Keno, KenoConfiguration, getFormattedNetMultiplier } from "@betswirl/sdk-core"
import { useMemo } from "react"

interface UseKenoMultipliersProps {
  kenoConfig: KenoConfiguration | undefined
  selectedNumbersCount: number
  houseEdge: number
}

interface UseKenoMultipliersResult {
  multipliers: number[]
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

    const rawMultipliers = kenoConfig.mutliplierTable[selectedNumbersCount]
    if (!rawMultipliers) {
      return []
    }

    return rawMultipliers
      .map((_, index) =>
        getFormattedNetMultiplier(
          Keno.getMultiplier(kenoConfig, selectedNumbersCount, index),
          houseEdge,
        ),
      )
      .reverse()
  }, [kenoConfig, selectedNumbersCount, houseEdge])

  return {
    multipliers,
    isLoading: !kenoConfig,
  }
}
