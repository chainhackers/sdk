import { WeightedGameConfiguration } from "@betswirl/sdk-core"
import { useCallback, useEffect, useState } from "react"
import { GameControlsProps } from "./shared/types"
import { Wheel } from "./wheel/Wheel"

interface WheelGameControlsProps extends GameControlsProps {
  config: WeightedGameConfiguration
  winningMultiplier?: number
}

interface WheelSegment {
  index: number
  multiplier: number
  formattedMultiplier: string
  color: string
  startAngle: number
  endAngle: number
  weight: bigint
}

const SPIN_DURATION = 4000

const WHEEL_ANIMATION_CONFIG = {
  MIN_ROTATIONS: 5,
  MAX_ADDITIONAL_ROTATIONS: 3,
  MAX_RANDOM_OFFSET: 20,
} as const

export function createWheelSegments(config: WeightedGameConfiguration): WheelSegment[] {
  const totalSegments = config.multipliers.length
  const anglePerSegment = 360 / totalSegments

  return config.multipliers.map((multiplier, index) => {
    const startAngle = index * anglePerSegment
    const endAngle = (index + 1) * anglePerSegment
    const formattedMultiplier =
      multiplier === 0n ? "0.00x" : `${(Number(multiplier) / 10000).toFixed(2)}x`

    return {
      index,
      multiplier: Number(multiplier),
      formattedMultiplier,
      color: config.colors?.[index] || "#29384C",
      startAngle,
      endAngle,
      weight: config.weights[index] || 1n,
    }
  })
}

function getTargetAngleForMultiplier(segments: WheelSegment[], winningMultiplier: number): number {
  const winningSegments = segments.filter((segment) => segment.multiplier === winningMultiplier)
  if (winningSegments.length === 0) {
    return 0
  }

  const randomSegment = winningSegments[Math.floor(Math.random() * winningSegments.length)]
  const fullRotations =
    WHEEL_ANIMATION_CONFIG.MIN_ROTATIONS +
    Math.floor(Math.random() * WHEEL_ANIMATION_CONFIG.MAX_ADDITIONAL_ROTATIONS)
  const targetAngle = fullRotations * 360 - randomSegment.startAngle

  return targetAngle
}

export function WheelGameControls({
  config,
  winningMultiplier,
  multiplier,
}: WheelGameControlsProps) {
  const [segments, setSegments] = useState<WheelSegment[]>([])
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [displayedWinningMultiplier, setDisplayedWinningMultiplier] = useState<number | undefined>()

  const resetWheelState = useCallback(() => {
    setHasResult(false)
    setDisplayedWinningMultiplier(undefined)
  }, [])

  const getDisplayMultiplier = (): number => {
    return displayedWinningMultiplier !== undefined
      ? displayedWinningMultiplier / 10000
      : multiplier
  }

  const isMultiplierWinning = (itemMultiplier: number): boolean => {
    return hasResult && displayedWinningMultiplier === itemMultiplier
  }

  useEffect(() => {
    const wheelSegments = createWheelSegments(config)
    setSegments(wheelSegments)
  }, [config])

  useEffect(() => {
    if (winningMultiplier === undefined) {
      resetWheelState()
    } else if (winningMultiplier !== displayedWinningMultiplier && segments.length > 0) {
      resetWheelState()
      setIsSpinning(true)
      const targetAngle = getTargetAngleForMultiplier(segments, winningMultiplier)
      setRotationAngle(targetAngle)

      const timer = setTimeout(() => {
        setIsSpinning(false)
        setDisplayedWinningMultiplier(winningMultiplier)
        setHasResult(true)
      }, SPIN_DURATION)

      return () => clearTimeout(timer)
    }
  }, [winningMultiplier, segments, displayedWinningMultiplier, resetWheelState])

  const uniqueMultipliers = segments
    .reduce(
      (acc, segment) => {
        const existing = acc.find((item) => item.multiplier === segment.multiplier)
        if (!existing) {
          acc.push({
            multiplier: segment.multiplier,
            formattedMultiplier: segment.formattedMultiplier,
            color: segment.color,
          })
        }
        return acc
      },
      [] as Array<{ multiplier: number; formattedMultiplier: string; color: string }>,
    )
    .sort((a, b) => a.multiplier - b.multiplier)

  return (
    <div className="flex flex-col items-center gap-[8px] absolute top-[8px] left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
      <Wheel
        rotationAngle={rotationAngle}
        isSpinning={isSpinning}
        multiplier={getDisplayMultiplier()}
        hasCompletedSpin={hasResult}
      />

      <div className="flex flex-wrap justify-center gap-[6px] w-full">
        {uniqueMultipliers.map((item) => {
          const isWinning = isMultiplierWinning(item.multiplier)
          return (
            <div
              key={item.multiplier}
              className="flex h-[24px] w-[49px] items-center justify-center rounded-[2px] bg-white/72 backdrop-blur-sm"
              style={{
                boxShadow: `0px 3px 0px 0px ${item.color}`,
                border: isWinning ? `1.5px solid ${item.color}` : "none",
              }}
            >
              <span className="text-xs font-bold">{item.formattedMultiplier}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
