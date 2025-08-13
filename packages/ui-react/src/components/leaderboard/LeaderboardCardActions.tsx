import { fetchLeaderboard } from "@betswirl/sdk-core"
import { useCallback, useEffect } from "react"
import { useAccount } from "wagmi"
import { useClaimLeaderboardRewards } from "../../hooks/useClaimLeaderboardRewards"
import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { useGameFrameContext } from "../game/GameFrame"
import { Button } from "../ui/button"

interface LeaderboardCardActionsProps {
  item: LeaderboardItem
  onViewOverview?: (id: string) => void
  onClaimSuccess?: () => void
}

export function LeaderboardCardActions({
  item,
  onViewOverview,
  onClaimSuccess,
}: LeaderboardCardActionsProps) {
  const { address } = useAccount()
  const { claim, isPending, isSuccess } = useClaimLeaderboardRewards()
  const { setIsLeaderboardSheetOpen } = useGameFrameContext()

  useEffect(() => {
    if (isSuccess && onClaimSuccess) {
      onClaimSuccess()
    }
  }, [isSuccess, onClaimSuccess])

  const handleClaim = useCallback(async () => {
    const leaderboard = await fetchLeaderboard(Number(item.id), address, true)

    if (!leaderboard) {
      console.error("Failed to fetch leaderboard for claiming")
      return
    }

    claim({ leaderboard })
  }, [item.id, address, claim])

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

  const ActionButton = ({
    children,
    onClick,
    disabled = false,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-primary hover:bg-primary/90",
        "text-white font-semibold",
        "rounded-[8px] h-[32px] flex-1",
        "text-[12px] leading-[20px]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {children}
    </Button>
  )

  const handlePlayNow = useCallback(() => {
    setIsLeaderboardSheetOpen(false)
  }, [setIsLeaderboardSheetOpen])

  switch (item.userAction.type) {
    case "play":
      return (
        <>
          <ActionButton onClick={handlePlayNow}>Play now</ActionButton>
          <OverviewButton />
        </>
      )

    case "claim":
      return (
        <>
          <ActionButton onClick={handleClaim} disabled={isPending}>
            {isPending
              ? "Claiming..."
              : `Claim ${item.userAction.amount} ${item.userAction.tokenSymbol}`}
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
