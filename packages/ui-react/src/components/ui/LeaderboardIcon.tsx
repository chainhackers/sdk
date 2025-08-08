import leaderboardIcon from "../../assets/game/leaderboard/leaderboard-button.svg"
import { cn } from "../../lib/utils"

interface LeaderboardIconProps {
  className?: string
}

export function LeaderboardIcon({ className }: LeaderboardIconProps) {
  return (
    <div className={cn("relative", className)}>
      <img
        src={leaderboardIcon}
        alt="Leaderboard"
        className="transition duration-200 group-hover:brightness-110"
      />
    </div>
  )
}
