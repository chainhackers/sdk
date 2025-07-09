import { WeightedGameConfiguration } from "@betswirl/sdk-core"
import { useEffect, useState } from "react"
import { GameControlsProps } from "./shared/types"
import { Wheel } from "./wheel/Wheel"
import { createWheelSegments, getTargetAngleForMultiplier, WheelSegment } from "./wheel/wheelConfig"

interface WheelGameControlsProps extends GameControlsProps {
  config: WeightedGameConfiguration
  winningMultiplier?: number
}

export function WheelGameControls({
  config,
  winningMultiplier,
  multiplier,
  isDisabled,
}: WheelGameControlsProps) {
  const [segments, setSegments] = useState<WheelSegment[]>([])
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [currentWinningMultiplier, setCurrentWinningMultiplier] = useState<number | undefined>()

  useEffect(() => {
    const wheelSegments = createWheelSegments(config)
    setSegments(wheelSegments)
  }, [config])

  useEffect(() => {
    if (winningMultiplier === undefined) {
      setHasResult(false)
      setCurrentWinningMultiplier(undefined)
    } else if (winningMultiplier !== currentWinningMultiplier && segments.length > 0) {
      setHasResult(false)
      setCurrentWinningMultiplier(undefined)
      setIsSpinning(true)
      const targetAngle = getTargetAngleForMultiplier(segments, winningMultiplier)
      setRotationAngle(targetAngle)

      const timer = setTimeout(() => {
        setIsSpinning(false)
        setCurrentWinningMultiplier(winningMultiplier)
        setHasResult(true)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [winningMultiplier, segments, currentWinningMultiplier])

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
    <>
      <div className="flex flex-col items-center gap-[8px] absolute top-[8px] left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
        <Wheel
          rotationAngle={rotationAngle}
          isSpinning={isSpinning}
          multiplier={
            currentWinningMultiplier !== undefined ? currentWinningMultiplier / 10000 : multiplier
          }
          hasResult={hasResult}
        />

        <div className="flex flex-wrap justify-center gap-[6px] w-full">
          {uniqueMultipliers.map((item) => {
            const isWinning = hasResult && currentWinningMultiplier === item.multiplier
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
    </>
  )
}
