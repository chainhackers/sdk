import { LEADERBOARD_STATUS } from "@betswirl/sdk-core"
import { useAccount } from "wagmi"
import type { RankingEntry } from "../../types/types"
import { Button } from "../ui/button"
import { LeaderboardRankingCard } from "./LeaderboardRankingCard"
import { LeaderboardRankingList } from "./LeaderboardRankingList"

interface LeaderboardRankingTabProps {
  rankingData: RankingEntry[]
  lastUpdate: string
  claimableAmount: number
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
  const { address: userAddress } = useAccount()
  const topThree = rankingData.slice(0, 3)
  const remainingEntries = rankingData.slice(3)

  const rankingEmptyText = (leaderboardStatus: LEADERBOARD_STATUS) => {
    switch (leaderboardStatus) {
      case LEADERBOARD_STATUS.PENDING:
      case LEADERBOARD_STATUS.NOT_STARTED:
      case LEADERBOARD_STATUS.ENDED:
        return "Rankings will appear once players start participating"
      case LEADERBOARD_STATUS.EXPIRED:
        return "This leaderboard has expired"
      case LEADERBOARD_STATUS.FINALIZED:
        return "No rankings data available for this completed leaderboard"
    }
  }

  const canClaim = leaderboardStatus === LEADERBOARD_STATUS.FINALIZED && claimableAmount > 0

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
          {topThree.map((entry) => {
            const isCurrentUser =
              userAddress && entry.playerAddress.toLowerCase() === userAddress.toLowerCase()
            return (
              <LeaderboardRankingCard
                key={`top-${entry.rank}-${entry.playerAddress}`}
                entry={entry}
                isCurrentUser={isCurrentUser}
              />
            )
          })}
        </div>
      )}

      {/* Remaining Rankings Table */}
      {remainingEntries.length > 0 && (
        <LeaderboardRankingList entries={remainingEntries} userAddress={userAddress} />
      )}

      {/* Empty State */}
      {rankingData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[16px] font-semibold text-card-foreground">No rankings available</p>
          <p className="text-[14px] text-muted-foreground mt-1">
            {rankingEmptyText(leaderboardStatus)}
          </p>
        </div>
      )}
    </div>
  )
}
