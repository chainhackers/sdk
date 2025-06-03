import { cn } from "../../../lib/utils"

interface GameMultiplierDisplayProps {
  multiplier: string | number
  className?: string
}

export function GameMultiplierDisplay({
  multiplier,
  className,
}: GameMultiplierDisplayProps) {
  const displayValue =
    typeof multiplier === "number" ? multiplier.toFixed(2) : multiplier

  return (
    <div
      className={cn(
        "absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white",
        className,
      )}
    >
      {displayValue} x
    </div>
  )
}
