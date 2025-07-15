import { BP_VALUE } from "@betswirl/sdk-core"
import { useCallback, useEffect, useRef, useState } from "react"
import { WheelSegment } from "../components/game/WheelGameControls"

interface UseWheelAnimationParams {
  spinDuration: number
  continuousSpinDuration: number
  segments: WheelSegment[]
  onSpinComplete?: () => void
}

interface UseWheelAnimationReturn {
  rotationAngle: number
  displayedMultiplier: number
  hasResult: boolean
  isSpinning: boolean
  winningSectorIndex: number | null
  startEndlessSpin: () => void
  spinWheelWithResult: (sectorIndex: number) => void
  stopSpin: () => void
}

const ANGLE_VARIANCE = 32
const FRAME_INTERVAL = 16
const MIN_FULL_ROTATIONS = 5
const MAX_FULL_ROTATIONS = 8

/**
 * Calculates the target angle for a winning sector index
 * @param segments - Array of wheel segments
 * @param winningSectorIndex - The winning sector index (0-based)
 * @returns Target angle in degrees for the wheel to stop at
 */
function getTargetAngleForSectorIndex(
  segments: WheelSegment[],
  winningSectorIndex: number,
): number {
  const segment = segments[winningSectorIndex]

  if (!segment) {
    console.warn(`Could not find segment for sector index: ${winningSectorIndex}`)
    return 0
  }

  const randomOffset = (Math.random() - 0.5) * ANGLE_VARIANCE
  const targetAngle = 360 - segment.startAngle + randomOffset

  const fullRotations =
    Math.floor(Math.random() * (MAX_FULL_ROTATIONS - MIN_FULL_ROTATIONS + 1)) + MIN_FULL_ROTATIONS

  return targetAngle + fullRotations * 360
}

/**
 * Custom hook that manages wheel animation logic
 * Handles continuous spinning, deceleration to winning position, and multiplier reveal
 */
export function useWheelAnimation({
  spinDuration,
  continuousSpinDuration,
  segments,
  onSpinComplete,
}: UseWheelAnimationParams): UseWheelAnimationReturn {
  const [rotationAngle, setRotationAngle] = useState(0)
  const [displayedMultiplier, setDisplayedMultiplier] = useState<number | undefined>()
  const [hasResult, setHasResult] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningSectorIndex, setWinningSectorIndex] = useState<number | null>(null)

  const spinStartTimeRef = useRef<number | null>(null)
  const lastKnownAngleRef = useRef<number>(0)
  const spinCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const continuousSpinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetWheelState = useCallback(() => {
    setHasResult(false)
    setDisplayedMultiplier(undefined)
  }, [])

  const getCurrentSpinAngle = useCallback(() => {
    if (!spinStartTimeRef.current) return lastKnownAngleRef.current

    const elapsed = Date.now() - spinStartTimeRef.current
    const rotations = elapsed / continuousSpinDuration
    const currentAngle = lastKnownAngleRef.current + rotations * 360

    return currentAngle
  }, [continuousSpinDuration])

  useEffect(() => {
    if (isSpinning && winningSectorIndex === null) {
      spinStartTimeRef.current = Date.now()

      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
      }

      const updateRotation = () => {
        const angle = getCurrentSpinAngle()
        setRotationAngle(angle)
      }

      continuousSpinIntervalRef.current = setInterval(updateRotation, FRAME_INTERVAL) // ~60fps
    } else if (!isSpinning && winningSectorIndex === null) {
      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
        continuousSpinIntervalRef.current = null
      }

      if (spinStartTimeRef.current) {
        const finalAngle = getCurrentSpinAngle()
        lastKnownAngleRef.current = finalAngle % 360
      }

      spinStartTimeRef.current = null
    }
  }, [isSpinning, winningSectorIndex, getCurrentSpinAngle])

  useEffect(() => {
    if (winningSectorIndex !== null && segments.length > 0 && isSpinning) {
      resetWheelState()

      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
        continuousSpinIntervalRef.current = null
      }

      const currentAngle = getCurrentSpinAngle()

      spinStartTimeRef.current = null

      const targetAngle = getTargetAngleForSectorIndex(segments, winningSectorIndex)

      const normalizedCurrent = currentAngle % 360
      const normalizedTarget = targetAngle % 360

      let rotationDiff = normalizedTarget - normalizedCurrent
      if (rotationDiff <= 0) {
        rotationDiff += 360
      }

      const extraRotations = Math.floor(targetAngle / 360)
      const finalAngle = currentAngle + rotationDiff + extraRotations * 360

      setRotationAngle(finalAngle)
      lastKnownAngleRef.current = normalizedTarget

      if (spinCompleteTimeoutRef.current) {
        clearTimeout(spinCompleteTimeoutRef.current)
      }

      spinCompleteTimeoutRef.current = setTimeout(() => {
        const winningSegment = segments[winningSectorIndex]
        setDisplayedMultiplier(winningSegment.multiplier)
        setHasResult(true)
        onSpinComplete?.()
      }, spinDuration)
    } else if (winningSectorIndex === null) {
      resetWheelState()
      if (spinCompleteTimeoutRef.current) {
        clearTimeout(spinCompleteTimeoutRef.current)
        spinCompleteTimeoutRef.current = null
      }
    }
  }, [
    winningSectorIndex,
    segments,
    isSpinning,
    resetWheelState,
    onSpinComplete,
    getCurrentSpinAngle,
    spinDuration,
  ])

  useEffect(() => {
    return () => {
      if (spinCompleteTimeoutRef.current) {
        clearTimeout(spinCompleteTimeoutRef.current)
      }
      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
      }
    }
  }, [])

  const startEndlessSpin = useCallback(() => {
    setIsSpinning(true)
    setWinningSectorIndex(null)
    resetWheelState()

    lastKnownAngleRef.current = lastKnownAngleRef.current % 360
  }, [resetWheelState])

  const spinWheelWithResult = useCallback(
    (sectorIndex: number) => {
      setIsSpinning(true)
      setWinningSectorIndex(null)
      resetWheelState()

      lastKnownAngleRef.current = lastKnownAngleRef.current % 360

      setTimeout(() => {
        setWinningSectorIndex(sectorIndex)
      }, 100)
    },
    [resetWheelState],
  )

  const stopSpin = useCallback(() => {
    if (spinCompleteTimeoutRef.current) {
      clearTimeout(spinCompleteTimeoutRef.current)
      spinCompleteTimeoutRef.current = null
    }
    if (continuousSpinIntervalRef.current) {
      clearInterval(continuousSpinIntervalRef.current)
      continuousSpinIntervalRef.current = null
    }

    setIsSpinning(false)
    setWinningSectorIndex(null)
    resetWheelState()

    spinStartTimeRef.current = null
  }, [resetWheelState])

  const numericDisplayedMultiplier =
    displayedMultiplier !== undefined ? displayedMultiplier / BP_VALUE : 0

  return {
    rotationAngle,
    displayedMultiplier: numericDisplayedMultiplier,
    hasResult,
    isSpinning,
    winningSectorIndex,
    startEndlessSpin,
    spinWheelWithResult,
    stopSpin,
  }
}
