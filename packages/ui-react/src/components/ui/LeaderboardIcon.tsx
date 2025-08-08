import leaderboardIcon from "../../assets/game/leaderboard/leaderboard-button.svg"

interface LeaderboardIconProps {
  className?: string
}

export function LeaderboardIcon({ className }: LeaderboardIconProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <img
        src={leaderboardIcon}
        alt="Leaderboard"
        className="transition duration-200 group-hover:brightness-110"
      />
    </div>
  )
}
