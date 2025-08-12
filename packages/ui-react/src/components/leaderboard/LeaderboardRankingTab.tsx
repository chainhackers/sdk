import { LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import type { RankingEntry } from "../../types/types"
import { Button } from "../ui/button"
import { LeaderboardRankingCard } from "./LeaderboardRankingCard"
import { LeaderboardRankingList } from "./LeaderboardRankingList"

interface LeaderboardRankingTabProps {
  rankingData: RankingEntry[]
  lastUpdate: string
  claimableAmount: string
  claimableTokenSymbol: string
  leaderboardStatus?: LEADERBOARD_STATUS
}

export function LeaderboardRankingTab({
  rankingData,
  lastUpdate,
  claimableAmount,
  claimableTokenSymbol,
  leaderboardStatus = LEADERBOARD_STATUS.PENDING,
}: LeaderboardRankingTabProps) {
  // Split top 3 and remaining entries
  const topThree = rankingData.slice(0, 3)
  const remainingEntries = rankingData.slice(3)

  // Determine if the claim button should be shown
  const canClaim =
    leaderboardStatus === LEADERBOARD_STATUS.FINALIZED && Number.parseFloat(claimableAmount) > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Claim Button */}
      {canClaim && (
        <Button className="bg-primary hover:bg-primary/89 text-white font-semibold rounded-[8px] h-[32px] px-4 text-[14px] w-full">
          Claim {claimableAmount} {claimableTokenSymbol}
        </Button>
      )}

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
            {leaderboardStatus === LEADERBOARD_STATUS.PENDING ||
            leaderboardStatus === LEADERBOARD_STATUS.NOT_STARTED ||
            leaderboardStatus === LEADERBOARD_STATUS.ENDED
              ? "Rankings will appear once players start participating"
              : leaderboardStatus === LEADERBOARD_STATUS.EXPIRED
                ? "This leaderboard has expired"
                : leaderboardStatus === LEADERBOARD_STATUS.FINALIZED
                  ? "No rankings data available for this completed leaderboard"
                  : "Rankings will appear once the competition starts"}
          </p>
        </div>
      )}
    </div>
  )
}
