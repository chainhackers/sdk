import type { RankingEntry } from "../../types/types"
import { TokenIcon } from "../ui/TokenIcon"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface LeaderboardRankingListProps {
  entries: RankingEntry[]
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function LeaderboardRankingList({ entries }: LeaderboardRankingListProps) {
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
          {entries.map((entry) => (
            <TableRow
              key={`${entry.rank}-${entry.playerAddress}`}
              className="border-b border-table-separator last:border-b-0 align-middle text-[12px] leading-[20px]"
            >
              <TableCell>
                <div className="flex gap-2">
                  <span className="text-roulette-disabled-text font-medium">#{entry.rank}</span>
                  <span className="font-medium text-foreground">
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
