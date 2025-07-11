import { BP_VALUE, WeightedGameConfiguration } from "@betswirl/sdk-core"
import { RefObject, useEffect, useState } from "react"
import wheelArrow from "../../assets/game/wheel-arrow.svg"
import wheelDark from "../../assets/game/wheel-dark.svg"
import wheelLight from "../../assets/game/wheel-light.svg"
import { useWheelAnimation } from "../../hooks/useWheelAnimation"
import { Theme, TokenWithImage } from "../../types/types"
import { TokenIcon } from "../ui/TokenIcon"
import { Tooltip, TooltipPrimitive, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"

export interface WheelSegment {
  index: number
  multiplier: number
  formattedMultiplier: string
  color: string
  startAngle: number
  endAngle: number
  weight: bigint
}

interface WheelGameControlsProps {
  config: WeightedGameConfiguration
  isSpinning: boolean
  winningMultiplier?: number
  theme?: Theme
  parent?: RefObject<HTMLDivElement>
  onSpinComplete?: () => void
  tooltipContent?: Record<
    number,
    {
      chance?: string
      profit?: React.ReactNode
      token: TokenWithImage
    }
  >
}

interface WheelProps {
  rotationAngle: number
  isSpinning: boolean
  multiplier: number
  hasCompletedSpin?: boolean
  theme?: Theme
  winningMultiplier?: number
}

const SPIN_DURATION = 3000
const CONTINUOUS_SPIN_DURATION = 1000

/**
 * Formats a multiplier value for display
 * @param multiplier - The multiplier value as bigint
 * @returns Formatted string representation (e.g., "1.50x", "0.00x")
 */
function formatMultiplier(multiplier: bigint): string {
  return multiplier === 0n ? "0.00x" : `${(Number(multiplier) / BP_VALUE).toFixed(2)}x`
}

/**
 * Creates wheel segments from game configuration
 * @param config - The weighted game configuration
 * @returns Array of wheel segments with calculated angles and formatting
 */
function createWheelSegments(config: WeightedGameConfiguration): WheelSegment[] {
  const totalSegments = config.multipliers.length
  const anglePerSegment = 360 / totalSegments

  return config.multipliers.map((multiplier, index) => {
    const startAngle = index * anglePerSegment
    const endAngle = (index + 1) * anglePerSegment
    const formattedMultiplier = formatMultiplier(multiplier)

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

function Wheel({
  rotationAngle,
  isSpinning,
  multiplier,
  hasCompletedSpin = false,
  theme = "light",
  winningMultiplier,
}: WheelProps) {
  const shouldShowMultiplier = hasCompletedSpin && !isSpinning
  const wheelSrc = theme === "dark" ? wheelDark : wheelLight

  // Determine if we should use transition (only when decelerating to final position with a result)
  const shouldUseTransition = isSpinning && winningMultiplier !== undefined

  return (
    <>
      <div className={"relative w-[192px] h-[148px] mx-auto"}>
        <div
          className={"absolute inset-0 flex items-center justify-center top-[12px]"}
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: shouldUseTransition
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
              : "none",
            transformOrigin: "center center",
          }}
        >
          <img src={wheelSrc} alt="Wheel colors" className="w-full h-full object-contain" />
        </div>
        {shouldShowMultiplier && (
          <GameMultiplierDisplay
            multiplier={multiplier}
            className={"absolute text-wheel-multiplier-text top-[80px] text-[18px]"}
          />
        )}
      </div>
      <img src={wheelArrow} alt="Wheel arrow" className="absolute" />
    </>
  )
}

export function WheelGameControls({
  config,
  isSpinning,
  winningMultiplier,
  theme = "light",
  parent: containerRef,
  onSpinComplete,
  tooltipContent,
}: WheelGameControlsProps) {
  const [segments, setSegments] = useState<WheelSegment[]>([])

  useEffect(() => {
    const wheelSegments = createWheelSegments(config)
    setSegments(wheelSegments)
  }, [config])

  const { rotationAngle, displayedMultiplier, hasResult } = useWheelAnimation({
    spinDuration: SPIN_DURATION,
    continuousSpinDuration: CONTINUOUS_SPIN_DURATION,
    isSpinning,
    winningMultiplier: winningMultiplier ?? null,
    segments,
    onSpinComplete: onSpinComplete ?? (() => {}),
  })

  const isMultiplierWinning = (itemMultiplier: number): boolean => {
    return hasResult && winningMultiplier === itemMultiplier
  }

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
    const itemTooltipContent = tooltipContent?.[item.multiplier]
    const hasTooltip =
      itemTooltipContent && (itemTooltipContent.chance || itemTooltipContent.profit)

    const multiplierContent = (
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

    if (!hasTooltip) {
      return multiplierContent
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{multiplierContent}</TooltipTrigger>
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
            <TokenIcon token={itemTooltipContent.token} size={15} />
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
          multiplier={displayedMultiplier}
          hasCompletedSpin={hasResult}
          theme={theme}
          winningMultiplier={winningMultiplier}
        />

        <div className={"flex flex-wrap justify-center gap-[6px] w-full"}>
          {uniqueMultipliers.map((item) => (
            <MultiplierItem key={item.multiplier} item={item} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
