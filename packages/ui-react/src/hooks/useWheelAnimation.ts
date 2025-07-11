import { BP_VALUE } from "@betswirl/sdk-core"
import { useCallback, useEffect, useRef, useState } from "react"
import { WheelSegment } from "../components/game/WheelGameControls"

interface UseWheelAnimationParams {
  spinDuration: number
  continuousSpinDuration: number
  isSpinning: boolean
  winningMultiplier: number | null
  segments: WheelSegment[]
  onSpinComplete: () => void
}

interface UseWheelAnimationReturn {
  rotationAngle: number
  displayedMultiplier: number
  hasResult: boolean
}

const ANGLE_VARIANCE = 32
const FRAME_INTERVAL = 16
const MIN_FULL_ROTATIONS = 5
const MAX_FULL_ROTATIONS = 8

/**
 * Calculates the target angle for a winning multiplier
 * @param segments - Array of wheel segments
 * @param winningMultiplier - The winning multiplier value
 * @returns Target angle in degrees for the wheel to stop at
 */
function getTargetAngleForMultiplier(segments: WheelSegment[], winningMultiplier: number): number {
  const matchingSegments = segments.filter((s) => s.multiplier === winningMultiplier)
  const segment = matchingSegments[Math.floor(Math.random() * matchingSegments.length)]

  if (!segment) {
    console.warn(`Could not find segment for multiplier: ${winningMultiplier}`)
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
  isSpinning,
  winningMultiplier,
  segments,
  onSpinComplete,
}: UseWheelAnimationParams): UseWheelAnimationReturn {
  const [rotationAngle, setRotationAngle] = useState(0)
  const [displayedMultiplier, setDisplayedMultiplier] = useState<number | undefined>()
  const [hasResult, setHasResult] = useState(false)

  const animationFrameRef = useRef<number | null>(null)
  const spinStartTimeRef = useRef<number | null>(null)
  const lastKnownAngleRef = useRef<number>(0)
  const spinCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const continuousSpinIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
    if (isSpinning && winningMultiplier === null) {
      spinStartTimeRef.current = Date.now()

      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
      }

      const updateRotation = () => {
        const angle = getCurrentSpinAngle()
        setRotationAngle(angle)
      }

      continuousSpinIntervalRef.current = setInterval(updateRotation, FRAME_INTERVAL) // ~60fps
    } else if (!isSpinning && winningMultiplier === null) {
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
  }, [isSpinning, winningMultiplier, getCurrentSpinAngle])

  useEffect(() => {
    if (winningMultiplier !== null && segments.length > 0 && isSpinning) {
      resetWheelState()

      if (continuousSpinIntervalRef.current) {
        clearInterval(continuousSpinIntervalRef.current)
        continuousSpinIntervalRef.current = null
      }

      const currentAngle = getCurrentSpinAngle()

      spinStartTimeRef.current = null

      const targetAngle = getTargetAngleForMultiplier(segments, winningMultiplier)

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
        setDisplayedMultiplier(winningMultiplier)
        setHasResult(true)
        onSpinComplete()
      }, spinDuration)
    } else if (winningMultiplier === null) {
      resetWheelState()
      if (spinCompleteTimeoutRef.current) {
        clearTimeout(spinCompleteTimeoutRef.current)
        spinCompleteTimeoutRef.current = null
      }
    }
  }, [
    winningMultiplier,
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const numericDisplayedMultiplier =
    displayedMultiplier !== undefined ? displayedMultiplier / BP_VALUE : 0

  return {
    rotationAngle,
    displayedMultiplier: numericDisplayedMultiplier,
    hasResult,
  }
}
