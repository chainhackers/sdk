import { useEffect, useRef, useState } from "react"
import { GameResult } from "../types/types"

interface UseDelayedGameResultParams {
  gameResult: GameResult | null
  betStatus: string | null
  delay: number
}

interface UseDelayedGameResultReturn {
  delayedGameResult: GameResult | null
  handleSpinComplete: () => void
}

/**
 * Custom hook for managing delayed game result display
 * Handles timeout logic and state management for wheel game results
 */
export function useDelayedGameResult({
  gameResult,
  betStatus,
  delay,
}: UseDelayedGameResultParams): UseDelayedGameResultReturn {
  const [delayedGameResult, setDelayedGameResult] = useState<GameResult | null>(null)
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle spin completion and delay result display
  const handleSpinComplete = () => {
    // Clear any existing timeout
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current)
    }

    // Capture the current game result to avoid closure issues
    const currentGameResult = gameResult

    // Set delayed result after specified delay
    resultTimeoutRef.current = setTimeout(() => {
      setDelayedGameResult(currentGameResult)
    }, delay)
  }

  // Clear timeout and delayed result when a new game starts
  useEffect(() => {
    if (betStatus === "rolling" || !betStatus) {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current)
        resultTimeoutRef.current = null
      }
      setDelayedGameResult(null)
    }
  }, [betStatus])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current)
      }
    }
  }, [])

  return {
    delayedGameResult,
    handleSpinComplete,
  }
}
