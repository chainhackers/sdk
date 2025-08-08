import { cn } from "../../lib/utils"
import type { RankingEntry } from "../../types/types"
import { TokenIcon } from "../ui/TokenIcon"
import { RankIcon } from "./RankIcon"

interface LeaderboardRankingCardProps {
  entry: RankingEntry
}

function getGradientClasses(rank: number) {
  const commonClasses = "bg-gradient-to-br"
  switch (rank) {
    case 1:
      return `${commonClasses} from-leaderboard-rank-gold-start via-leaderboard-rank-gold-mid to-leaderboard-rank-gold-end`
    case 2:
      return `${commonClasses} from-leaderboard-rank-silver-start via-leaderboard-rank-silver-mid to-leaderboard-rank-silver-end`
    case 3:
      return `${commonClasses} from-leaderboard-rank-bronze-start via-leaderboard-rank-bronze-mid to-leaderboard-rank-bronze-end`
    default:
      return ""
  }
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function LeaderboardRankingCard({ entry }: LeaderboardRankingCardProps) {
  const { rank, playerAddress, points, rewardAmount, rewardToken } = entry

  const CardContent = () => (
    <div className="flex items-start gap-4">
      <RankIcon rank={rank} />
      <div className="flex-1 text-[14px] leading-[22px]">
        <div className="font-semibold text-foreground">{formatAddress(playerAddress)}</div>
        <div>{points.toLocaleString()} points</div>
        <div className="flex items-center gap-1">
          <TokenIcon token={rewardToken} size={20} />
          <span className="text-foreground">{rewardAmount}</span>
        </div>
      </div>
    </div>
  )

  if (rank > 3) {
    return (
      <div className="bg-free-bet-card-section-bg rounded-[12px] p-4 border border-gray-200">
        <CardContent />
      </div>
    )
  }

  return (
    <div className={cn("rounded-[12px] p-[1px]", getGradientClasses(rank))}>
      <div className="bg-free-bet-card-section-bg rounded-[10px] p-4 h-full w-full">
        <CardContent />
      </div>
    </div>
  )
}
