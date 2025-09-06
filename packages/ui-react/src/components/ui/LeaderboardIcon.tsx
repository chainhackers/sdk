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
          variant="default"
          className="absolute -bottom-0.5 -right-0.5 h-4 min-w-[16px] rounded-full flex items-center justify-center text-[9px] leading-none font-bold px-1 py-0 text-play-btn-font"
        >
          <span className="relative top-[0.5px]">{count}</span>
        </Badge>
      )}
    </div>
  )
}
