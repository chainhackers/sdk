import { Gift } from "lucide-react"
import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"

interface LeaderboardCardProps {
  item: LeaderboardItem
}

export function LeaderboardCard({ item }: LeaderboardCardProps) {
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

  const renderActionButtons = () => {
    const buttons = []

    switch (item.userAction.type) {
      case "play":
        buttons.push(
          <Button
            key="play"
            className={cn(
              "bg-primary hover:bg-primary/90",
              "text-white font-semibold",
              "rounded-[8px] h-[32px] flex-1",
              "text-[12px] leading-[20px]",
            )}
          >
            Play now
          </Button>,
        )
        buttons.push(
          <Button
            key="overview"
            variant="secondary"
            className={cn(
              "bg-gray-200 hover:bg-gray-300",
              "text-foreground font-semibold",
              "rounded-[8px] h-[32px] flex-1",
              "text-[12px] leading-[20px]",
            )}
          >
            Overview
          </Button>,
        )
        break
      case "claim":
        buttons.push(
          <Button
            key="claim"
            className={cn(
              "bg-primary hover:bg-primary/90",
              "text-white font-semibold",
              "rounded-[8px] h-[32px] flex-1",
              "text-[12px] leading-[20px]",
            )}
          >
            Claim {item.userAction.amount} {item.userAction.tokenSymbol}
          </Button>,
        )
        buttons.push(
          <Button
            key="overview"
            variant="secondary"
            className={cn(
              "bg-gray-200 hover:bg-gray-300",
              "text-foreground font-semibold",
              "rounded-[8px] h-[32px] flex-1",
              "text-[12px] leading-[20px]",
            )}
          >
            Overview
          </Button>,
        )
        break
      case "overview":
        buttons.push(
          <Button
            key="overview"
            variant="secondary"
            className={cn(
              "bg-gray-200 hover:bg-gray-300",
              "text-foreground font-semibold",
              "rounded-[8px] h-[32px] w-full",
              "text-[12px] leading-[20px]",
            )}
          >
            Overview
          </Button>,
        )
        break
    }

    return buttons
  }

  return (
    <div
      className={cn("p-[12px] rounded-[12px]", "bg-gray-100", "flex flex-col gap-[10px] h-[156px]")}
    >
      {/* Header with rank, date and badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[4px]">
            <ChainIcon chainId={item.chainId} size={20} />
            <span className="text-gray-600 text-[14px] leading-[22px] font-medium">
              #{item.rank}
            </span>
          </div>
          {/* Vertical Separator */}
          <span
            aria-hidden
            className="block w-px h-[23px] bg-[var(--border)]"
          />
          <span className="text-gray-500 text-[12px] leading-[18px] font-regular">
            {formatDateRange(item.startDate, item.endDate)}
          </span>
        </div>
        {item.badgeStatus && (
          <div
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium",
              item.badgeStatus === "pending" &&
                "text-blue-600 border border-blue-600 rounded-[8px]",
              item.badgeStatus === "expired" &&
                "text-gray-600 border border-gray-600 rounded-[8px]",
            )}
          >
            {item.badgeStatus.charAt(0).toUpperCase() + item.badgeStatus.slice(1)}
          </div>
        )}
      </div>

      {/* Title with chain icon */}
      <div className="flex items-center">
        <h3 className="text-gray-900 font-semibold text-[14px] leading-[22px]">{item.title}</h3>
      </div>

      {/* Prize and participants */}
      <div className="flex items-center justify-between">
        <div className="flex items-center px-[8px] py-[2px] h-[24px] rounded-[8px] text-free-bet-border bg-free-bet-border/20 border border-free-bet-border hover:bg-free-bet-border/30 transition-colors">
          <Gift size={16} />
          <span className="font-medium text-[12px] leading-[20px]">
            {item.prize.token.symbol} {item.prize.amount}
          </span>
        </div>
        <span>
          <span className="text-gray-500 text-[12px] leading-[18px]">Participants:</span>{" "}
          <span className="text-[12px] leading-[20px]">
            {formatParticipants(item.participants)}
          </span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-[10px]">{renderActionButtons()}</div>
    </div>
  )
}
