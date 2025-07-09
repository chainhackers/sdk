import { WeightedGameConfiguration } from "@betswirl/sdk-core"
import { useCallback, useEffect, useState } from "react"
import wheel from "../../assets/game/wheel.svg"
import wheelArrow from "../../assets/game/wheel-arrow.svg"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

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

interface WheelProps {
  rotationAngle: number
  isSpinning: boolean
  multiplier: number
  hasCompletedSpin?: boolean
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

function Wheel({ rotationAngle, isSpinning, multiplier, hasCompletedSpin = false }: WheelProps) {
  const [currentAngle, setCurrentAngle] = useState(0)
  const shouldShowMultiplier = hasCompletedSpin && !isSpinning

  useEffect(() => {
    if (rotationAngle !== currentAngle) {
      setCurrentAngle(rotationAngle)
    }
  }, [rotationAngle, currentAngle])

  return (
    <>
      <div className="relative w-[192px] h-[148px] mx-auto">
        <div
          className="absolute inset-0 flex items-center justify-center top-[12px]"
          style={{
            transform: `rotate(${currentAngle}deg)`,
            transition: isSpinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
          }}
        >
          <img src={wheel} alt="Wheel colors" className="w-full h-full object-contain" />
        </div>
        {shouldShowMultiplier && (
          <GameMultiplierDisplay
            multiplier={multiplier}
            className="absolute text-black top-[80px] text-[18px]"
          />
        )}
      </div>
      <img src={wheelArrow} alt="Wheel arrow" className="absolute" />
    </>
  )
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
