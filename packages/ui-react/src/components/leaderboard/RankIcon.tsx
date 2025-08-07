import Place1Icon from "../../assets/game/leaderboard/place-1.svg"
import Place2Icon from "../../assets/game/leaderboard/place-2.svg"
import Place3Icon from "../../assets/game/leaderboard/place-3.svg"
import { cn } from "../../lib/utils"

interface RankIconProps {
  rank: number
  className?: string
}

export function RankIcon({ rank, className }: RankIconProps) {
  const getIconSrc = (rank: number): string | null => {
    switch (rank) {
      case 1:
        return Place1Icon
      case 2:
        return Place2Icon
      case 3:
        return Place3Icon
      default:
        return null
    }
  }

  const iconSrc = getIconSrc(rank)

  if (!iconSrc) {
    return null
  }

  return (
    <div className={cn("relative w-10 h-10", className)}>
      <img src={iconSrc} alt={`Place ${rank}`} className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-bold text-lg drop-shadow-md">{rank}</span>
      </div>
    </div>
  )
}
