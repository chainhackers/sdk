import { type Address } from "viem"
import type { RankingEntry } from "../../types/types"
import { formatAddress } from "../../utils/leaderboardUtils"
import { TokenIcon } from "../ui/TokenIcon"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface LeaderboardRankingListProps {
  entries: RankingEntry[]
  userAddress?: Address
}

export function LeaderboardRankingList({ entries, userAddress }: LeaderboardRankingListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[14px] text-roulette-disabled-text">No additional rankings to display</p>
      </div>
    )
  }

  return (
    <div className="rounded-[12px] overflow-hidden">
      <Table className="text-sm font-medium">
        <TableHeader>
          <TableRow className="border-b border-table-separator text-[12px] leading-[20px]">
            <TableHead className="text-text-on-surface-variant text-left">Player</TableHead>
            <TableHead className="text-text-on-surface-variant text-right">Points</TableHead>
            <TableHead className="text-text-on-surface-variant text-right">Reward</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isCurrentUser =
              userAddress && entry.playerAddress.toLowerCase() === userAddress.toLowerCase()
            return (
              <TableRow
                key={`${entry.rank}-${entry.playerAddress}`}
                className={`border-b border-table-separator last:border-b-0 align-middle text-[12px] leading-[20px] ${
                  isCurrentUser ? "bg-primary/5" : ""
                }`}
              >
                <TableCell>
                  <div className="flex gap-2">
                    <span
                      className={`font-medium ${isCurrentUser ? "text-primary" : "text-roulette-disabled-text"}`}
                    >
                      #{entry.rank}
                    </span>
                    <span
                      className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}
                    >
                      {formatAddress(entry.playerAddress)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-table-text">
                  <span className="font-medium">{entry.points.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-medium text-table-text">{entry.rewardAmount}</span>
                    <TokenIcon token={entry.rewardToken} size={16} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
