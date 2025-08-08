import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { Button } from "../ui/button"

interface LeaderboardCardActionsProps {
  item: LeaderboardItem
  onViewOverview?: (id: string) => void
}

export function LeaderboardCardActions({ item, onViewOverview }: LeaderboardCardActionsProps) {
  const OverviewButton = ({ isFullWidth = false }: { isFullWidth?: boolean }) => (
    <Button
      variant="secondary"
      onClick={() => onViewOverview?.(item.id)}
      className={cn(
        "bg-button-secondary-bg",
        "text-primary font-semibold",
        "rounded-[8px] h-[32px]",
        "text-[12px] leading-[20px]",
        isFullWidth ? "w-full" : "flex-1",
      )}
    >
      Overview
    </Button>
  )

  const ActionButton = ({ children }: { children: React.ReactNode }) => (
    <Button
      className={cn(
        "bg-primary hover:bg-primary/90",
        "text-white font-semibold",
        "rounded-[8px] h-[32px] flex-1",
        "text-[12px] leading-[20px]",
      )}
    >
      {children}
    </Button>
  )

  switch (item.userAction.type) {
    case "play":
      return (
        <>
          <ActionButton>Play now</ActionButton>
          <OverviewButton />
        </>
      )

    case "claim":
      return (
        <>
          <ActionButton>
            Claim {item.userAction.amount} {item.userAction.tokenSymbol}
          </ActionButton>
          <OverviewButton />
        </>
      )

    case "overview":
      return <OverviewButton isFullWidth />

    default:
      return null
  }
}
