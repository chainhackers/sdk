import { Gift } from "lucide-react"
import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { ChainIcon } from "../ui/ChainIcon"
import { LeaderboardCardActions } from "./LeaderboardCardActions"

interface LeaderboardCardProps {
  item: LeaderboardItem
  onViewOverview?: (id: string) => void
  onClaimSuccess?: () => void
}

export function LeaderboardCard({ item, onViewOverview, onClaimSuccess }: LeaderboardCardProps) {
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startMonth = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const endMonth = end.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const startDay = start.getDate()
    const endDay = end.getDate()

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
  }

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return count.toLocaleString()
    }
    return count.toString()
  }

  return (
    <div
      className={cn(
        "p-[12px] rounded-[12px]",
        "bg-free-bet-card-section-bg text-foreground",
        "flex flex-col gap-[10px] h-[156px]",
      )}
    >
      {/* Header with rank, date and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[4px]">
            <ChainIcon chainId={item.chainId} size={20} />
            <span className="text-foreground text-[14px] leading-[22px] font-medium">
              #{item.rank}
            </span>
          </div>
          {/* Vertical Separator */}
          <span aria-hidden className="block w-px h-[23px] bg-leaderboard-separator" />
          <span className="text-roulette-disabled-text text-[12px] leading-[18px] font-regular">
            {formatDateRange(item.startDate, item.endDate)}
          </span>
        </div>
        {item.badgeStatus && (
          <div
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium",
              item.badgeStatus === "pending" && "text-primary border border-primary rounded-[8px]",
              item.badgeStatus === "expired" &&
                "text-roulette-disabled-text border border-roulette-disabled-text rounded-[8px]",
            )}
          >
            {item.badgeStatus.charAt(0).toUpperCase() + item.badgeStatus.slice(1)}
          </div>
        )}
      </div>

      {/* Title with chain icon */}
      <div className="flex items-center">
        <h3 className="text-foreground font-semibold text-[14px] leading-[22px]">{item.title}</h3>
      </div>

      {/* Prize and participants */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center px-[8px] py-[2px] h-[24px] rounded-[8px] border transition-colors",
            item.badgeStatus === "expired"
              ? "text-roulette-disabled-text bg-roulette-disabled-text/20 border-roulette-disabled-text"
              : "text-free-bet-border bg-free-bet-border/20 border-free-bet-border",
          )}
        >
          <Gift size={16} />
          <span className="font-medium text-[12px] leading-[20px]">
            {item.prize.token.symbol} {item.prize.amount}
          </span>
        </div>
        <span>
          <span className="text-roulette-disabled-text text-[12px] leading-[18px]">
            Participants:
          </span>{" "}
          <span className="text-[12px] leading-[20px]">
            {formatParticipants(item.participants)}
          </span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-[10px]">
        <LeaderboardCardActions
          item={item}
          onViewOverview={onViewOverview}
          onClaimSuccess={onClaimSuccess}
        />
      </div>
    </div>
  )
}
