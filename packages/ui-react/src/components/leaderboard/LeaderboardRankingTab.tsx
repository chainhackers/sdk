import type { RankingEntry } from "../../types/types"
import { Button } from "../ui/button"
import { LeaderboardRankingCard } from "./LeaderboardRankingCard"
import { LeaderboardRankingList } from "./LeaderboardRankingList"

interface LeaderboardRankingTabProps {
  rankingData: RankingEntry[]
  lastUpdate: string
  claimableAmount: string
  claimableTokenSymbol: string
}

export function LeaderboardRankingTab({
  rankingData,
  lastUpdate,
  claimableAmount,
  claimableTokenSymbol,
}: LeaderboardRankingTabProps) {
  // Split top 3 and remaining entries
  const topThree = rankingData.slice(0, 3)
  const remainingEntries = rankingData.slice(3)

  return (
    <div className="flex flex-col gap-3">
      {/* Claim Button */}
      <Button className="bg-primary hover:bg-primary/89 text-white font-semibold rounded-[8px] h-[32px] px-4 text-[14px] w-full">
        Claim {claimableAmount} {claimableTokenSymbol}
      </Button>

      {/* Last Update Info */}
      <div className="text-[12px] text-muted-foreground text-center">{lastUpdate}</div>

      {/* Top 3 Cards */}
      {topThree.length > 0 && (
        <div className="flex flex-col gap-3">
          {topThree.map((entry) => (
            <LeaderboardRankingCard
              key={`top-${entry.rank}-${entry.playerAddress}`}
              entry={entry}
            />
          ))}
        </div>
      )}

      {/* Remaining Rankings Table */}
      {remainingEntries.length > 0 && <LeaderboardRankingList entries={remainingEntries} />}

      {/* Empty State */}
      {rankingData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[16px] font-semibold text-card-foreground">No rankings available</p>
          <p className="text-[14px] text-muted-foreground mt-1">
            Rankings will appear once the competition starts
          </p>
        </div>
      )}
    </div>
  )
}
