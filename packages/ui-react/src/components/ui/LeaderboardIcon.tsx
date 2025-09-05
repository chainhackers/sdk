import leaderboardIcon from "../../assets/game/leaderboard/leaderboard-button.svg"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"

interface LeaderboardIconProps {
  className?: string
  count?: number
}

export function LeaderboardIcon({ className, count }: LeaderboardIconProps) {
  return (
    <div className={cn("relative", className)}>
      <img
        src={leaderboardIcon}
        alt="Leaderboard"
        className="transition duration-200 group-hover:brightness-110"
      />
      {count !== undefined && count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-bold min-w-[20px]"
        >
          {count}
        </Badge>
      )}
    </div>
  )
}
