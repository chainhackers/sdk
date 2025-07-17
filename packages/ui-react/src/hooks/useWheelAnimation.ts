import { BP_VALUE } from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { WheelSegment } from "../components/game/WheelGameControls"

type WheelAnimationStatus = "IDLE" | "SPINNING_CONTINUOUS" | "SPINNING_TO_RESULT" | "STOPPED"

interface WheelAnimationState {
  status: WheelAnimationStatus
  rotationAngle: number
  winningSectorIndex: number | null
  isTransitionEnabled: boolean
}

type WheelAnimationAction =
  | { type: "START_SPIN" }
  | { type: "TICK"; payload: { speed: number } }
  | { type: "SET_RESULT"; payload: { sectorIndex: number; segments: WheelSegment[] } }
  | { type: "FINISH_SPIN" }
  | { type: "STOP" }
  | { type: "RESET" }

interface UseWheelAnimationParams {
  spinDuration: number
  segments: WheelSegment[]
}

interface UseWheelAnimationReturn {
  rotationAngle: number
  displayedMultiplier: number
  hasResult: boolean
  isSpinning: boolean
  isTransitionEnabled: boolean
  winningSectorIndex: number | null
  startEndlessSpin: () => void
  spinWheelWithResult: (sectorIndex: number) => void
  stopSpin: () => void
}

const ANGLE_VARIANCE = 32
const MIN_FULL_ROTATIONS = 5
const MAX_FULL_ROTATIONS = 8
const CONTINUOUS_SPIN_SPEED = 4

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

const initialState: WheelAnimationState = {
  status: "IDLE",
  rotationAngle: 0,
  winningSectorIndex: null,
  isTransitionEnabled: false,
}

function wheelAnimationReducer(
  state: WheelAnimationState,
  action: WheelAnimationAction,
): WheelAnimationState {
  switch (action.type) {
    case "START_SPIN":
      return {
        ...state,
        status: "SPINNING_CONTINUOUS",
        rotationAngle: state.rotationAngle % 360,
        winningSectorIndex: null,
        isTransitionEnabled: false,
      }

    case "TICK":
      return {
        ...state,
        rotationAngle: state.rotationAngle + action.payload.speed,
      }

    case "SET_RESULT":
      if (state.status === "SPINNING_CONTINUOUS") {
        const baseTargetAngle = getTargetAngleForSectorIndex(
          action.payload.segments,
          action.payload.sectorIndex,
        )
        let finalAngle = baseTargetAngle
        while (finalAngle < state.rotationAngle) {
          finalAngle += 360
        }

        return {
          ...state,
          status: "SPINNING_TO_RESULT",
          winningSectorIndex: action.payload.sectorIndex,
          rotationAngle: finalAngle,
          isTransitionEnabled: true,
        }
      }
      return state

    case "FINISH_SPIN":
      return {
        ...state,
        status: "STOPPED",
      }

    case "STOP":
      return {
        ...state,
        status: "STOPPED",
        isTransitionEnabled: false,
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

export function useWheelAnimation({
  spinDuration,
  segments,
}: UseWheelAnimationParams): UseWheelAnimationReturn {
  const [state, dispatch] = useReducer(wheelAnimationReducer, initialState)

  const continuousSpinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spinCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanupTimers = useCallback(() => {
    if (continuousSpinIntervalRef.current) {
      clearInterval(continuousSpinIntervalRef.current)
      continuousSpinIntervalRef.current = null
    }
    if (spinCompleteTimeoutRef.current) {
      clearTimeout(spinCompleteTimeoutRef.current)
      spinCompleteTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (state.status === "SPINNING_CONTINUOUS") {
      continuousSpinIntervalRef.current = setInterval(() => {
        dispatch({
          type: "TICK",
          payload: { speed: CONTINUOUS_SPIN_SPEED },
        })
      }, 16)
    }

    if (state.status === "SPINNING_TO_RESULT" && state.winningSectorIndex !== null) {
      cleanupTimers()

      spinCompleteTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "FINISH_SPIN" })
      }, spinDuration)
    }

    if (state.status === "IDLE" || state.status === "STOPPED") {
      cleanupTimers()
    }

    return cleanupTimers
  }, [state.status, state.winningSectorIndex, segments, spinDuration, cleanupTimers])

  const startEndlessSpin = useCallback(() => {
    dispatch({ type: "START_SPIN" })
  }, [])

  const spinWheelWithResult = useCallback(
    (sectorIndex: number) => {
      if (state.status === "IDLE" || state.status === "STOPPED") {
        dispatch({ type: "START_SPIN" })
        setTimeout(() => {
          dispatch({
            type: "SET_RESULT",
            payload: { sectorIndex, segments },
          })
        }, 100)
      } else if (state.status === "SPINNING_CONTINUOUS") {
        dispatch({
          type: "SET_RESULT",
          payload: { sectorIndex, segments },
        })
      }
    },
    [state.status, segments],
  )

  const stopSpin = useCallback(() => {
    dispatch({ type: "STOP" })
  }, [])

  const displayedMultiplier = useMemo(() => {
    if (state.status === "STOPPED" && state.winningSectorIndex !== null) {
      const winningSegment = segments[state.winningSectorIndex]
      return winningSegment ? winningSegment.multiplier / BP_VALUE : 0
    }
    return 0
  }, [state.status, state.winningSectorIndex, segments])

  return {
    rotationAngle: state.rotationAngle,
    displayedMultiplier,
    hasResult: state.status === "STOPPED",
    isSpinning: state.status === "SPINNING_CONTINUOUS" || state.status === "SPINNING_TO_RESULT",
    isTransitionEnabled: state.isTransitionEnabled,
    winningSectorIndex: state.winningSectorIndex,
    startEndlessSpin,
    spinWheelWithResult,
    stopSpin,
  }
}
