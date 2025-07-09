import { WeightedGameConfiguration } from "@betswirl/sdk-core"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { useCallback, useEffect, useState } from "react"
import wheelArrow from "../../assets/game/wheel-arrow.svg"
import wheelDark from "../../assets/game/wheel-dark.svg"
import wheelLight from "../../assets/game/wheel-light.svg"
import { Theme, TokenWithImage } from "../../types/types"
import { TokenIcon } from "../ui/TokenIcon"
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

interface WheelGameControlsProps extends GameControlsProps {
  config: WeightedGameConfiguration
  winningMultiplier?: number
  theme?: Theme
  betAmount?: bigint
  token?: TokenWithImage
  houseEdge?: number
  parent?: React.RefObject<HTMLDivElement | null>
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
  theme?: Theme
}

const SPIN_DURATION = 4000

const WHEEL_ANIMATION_CONFIG = {
  MIN_ROTATIONS: 5,
  MAX_ADDITIONAL_ROTATIONS: 3,
  MAX_RANDOM_OFFSET: 16,
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
  const randomOffset = (Math.random() > 0.5 ? 1 : -1) * Math.random() * WHEEL_ANIMATION_CONFIG.MAX_RANDOM_OFFSET
  const targetAngle = fullRotations * 360 - randomSegment.startAngle + randomOffset

  return targetAngle
}

function Wheel({
  rotationAngle,
  isSpinning,
  multiplier,
  hasCompletedSpin = false,
  theme = "light",
}: WheelProps) {
  const [currentAngle, setCurrentAngle] = useState(0)
  const shouldShowMultiplier = hasCompletedSpin && !isSpinning
  const wheelSrc = theme === "dark" ? wheelDark : wheelLight

  useEffect(() => {
    if (rotationAngle !== currentAngle) {
      setCurrentAngle(rotationAngle)
    }
  }, [rotationAngle, currentAngle])

  return (
    <>
      <div className="relative w-[192px] h-[148px] mx-auto">
        <div
          className={`absolute inset-0 flex items-center justify-center top-[12px] ${
            isSpinning ? "wheel-spinning" : ""
          }`}
          style={{ transform: `rotate(${currentAngle}deg)` }}
        >
          <img src={wheelSrc} alt="Wheel colors" className="w-full h-full object-contain" />
        </div>
        {shouldShowMultiplier && (
          <GameMultiplierDisplay
            multiplier={multiplier}
            className="absolute text-wheel-multiplier-text top-[80px] text-[18px]"
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
  theme = "light",
  betAmount = 0n,
  token,
  parent: containerRef,
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

  const MultiplierItem = ({
    item,
  }: {
    item: { multiplier: number; formattedMultiplier: string; color: string }
  }) => {
    const isWinning = isMultiplierWinning(item.multiplier)

    if (!token || !betAmount || betAmount === 0n) {
      return (
        <div
          className={`flex h-[24px] w-[49px] items-center justify-center rounded-[2px] backdrop-blur-sm bg-wheel-multiplier-bg text-wheel-multiplier-text wheel-multiplier-item ${
            isWinning ? "wheel-multiplier-winning" : ""
          }`}
          style={
            {
              "--wheel-color": item.color,
            } as React.CSSProperties
          }
        >
          <span className="text-xs font-bold">{item.formattedMultiplier}</span>
        </div>
      )
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex h-[24px] w-[49px] items-center justify-center rounded-[2px] backdrop-blur-sm bg-wheel-multiplier-bg text-wheel-multiplier-text wheel-multiplier-item cursor-default ${
              isWinning ? "wheel-multiplier-winning" : ""
            }`}
            style={
              {
                "--wheel-color": item.color,
              } as React.CSSProperties
            }
          >
            <span className="text-xs font-bold">{item.formattedMultiplier}</span>
          </div>
        </TooltipTrigger>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={5}
          collisionBoundary={containerRef?.current}
          collisionPadding={19}
          className="px-2 py-1 text-xs font-medium rounded-[2px] bg-wheel-multiplier-bg text-wheel-multiplier-text border-none shadow-none flex flex-col items-start gap-1 z-50"
        >
          <div className="flex items-center gap-1">
            <span>Chance to draw: </span>
            <span className="text-game-win font-bold">{20}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Target profit: </span>
            <span className="font-bold">{1.4}</span>
            <TokenIcon token={token} size={15} />
          </div>
          <TooltipPrimitive.Arrow className="fill-wheel-multiplier-bg z-50" width={10} height={5} />
        </TooltipPrimitive.Content>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-[8px] absolute top-[8px] left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
        <Wheel
          rotationAngle={rotationAngle}
          isSpinning={isSpinning}
          multiplier={getDisplayMultiplier()}
          hasCompletedSpin={hasResult}
          theme={theme}
        />

        <div className="flex flex-wrap justify-center gap-[6px] w-full">
          {uniqueMultipliers.map((item) => (
            <MultiplierItem key={item.multiplier} item={item} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
