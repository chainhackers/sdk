import { cn } from "../../lib/utils"
import { TokenIcon } from "../ui/TokenIcon"
import { RankIcon } from "./RankIcon"
import type { RankingEntry } from "../../types/types"

interface LeaderboardRankingCardProps {
  entry: RankingEntry
}

function getBorderColor(rank: number) {
  switch (rank) {
    case 1:
      return "border-leaderboard-rank-gold"
    case 2:
      return "border-leaderboard-rank-silver"
    case 3:
      return "border-leaderboard-rank-bronze"
    default:
      return "border-gray-200"
  }
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function LeaderboardRankingCard({ entry }: LeaderboardRankingCardProps) {
  const { rank, playerAddress, points, rewardAmount, rewardToken } = entry

  return (
    <div
      className={cn(
        "bg-surface-secondary rounded-[12px] p-4 border-1",
        getBorderColor(rank)
      )}
    >
      <div className="flex items-start gap-4">
        <RankIcon rank={rank} />
        <div className="flex-1 text-[14px] leading-[22px]">
          <div className="font-semibold text-foreground">
            {formatAddress(playerAddress)}
          </div>
          <div>
            {points.toLocaleString()} points
          </div>
          <div className="flex items-center gap-1">
            <TokenIcon token={rewardToken} size={20} />
            <span className="text-foreground">
              {rewardAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
