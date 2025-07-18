import { cn } from "../../../lib/utils"

interface GameMultiplierDisplayProps {
  multiplier: number
  className?: string
}

export function GameMultiplierDisplay({ multiplier, className }: GameMultiplierDisplayProps) {
  const displayValue = multiplier.toFixed(2)

  return (
    <div
      className={cn(
        "absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-text-color",
        className,
      )}
    >
      {displayValue}x
    </div>
  )
}
