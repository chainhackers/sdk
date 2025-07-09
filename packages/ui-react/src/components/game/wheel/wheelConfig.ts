import { WeightedGameConfiguration } from "@betswirl/sdk-core"

export interface WheelSegment {
  index: number
  multiplier: number
  formattedMultiplier: string
  color: string
  startAngle: number
  endAngle: number
  weight: bigint
}

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

export function getTargetAngleForMultiplier(
  segments: WheelSegment[],
  winningMultiplier: number,
): number {
  const winningSegments = segments.filter((segment) => segment.multiplier === winningMultiplier)
  if (winningSegments.length === 0) {
    return 0
  }

  const randomSegment = winningSegments[Math.floor(Math.random() * winningSegments.length)]
  const fullRotations = 5 + Math.floor(Math.random() * 3)
  const targetAngle = fullRotations * 360 - randomSegment.startAngle

  return targetAngle
}
