import { useCallback, useEffect } from "react"
import { fetchLeaderboard } from "@betswirl/sdk-core"
import { useAccount } from "wagmi"
import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { Button } from "../ui/button"
import { useClaimLeaderboardRewards } from "../../hooks/useClaimLeaderboardRewards"

interface LeaderboardCardActionsProps {
  item: LeaderboardItem
  onViewOverview?: (id: string) => void
  onClaimSuccess?: () => void
}

export function LeaderboardCardActions({ item, onViewOverview, onClaimSuccess }: LeaderboardCardActionsProps) {
  const { address } = useAccount()
  const { claim, isPending, isSuccess } = useClaimLeaderboardRewards()

  // Handle successful claim
  useEffect(() => {
    if (isSuccess && onClaimSuccess) {
      onClaimSuccess()
    }
  }, [isSuccess, onClaimSuccess])

  // Handle claim button click
  const handleClaim = useCallback(async () => {
    // Fetch the full leaderboard object for claiming
    const leaderboard = await fetchLeaderboard(
      Number(item.id),
      address,
      false
    )

    if (!leaderboard) {
      console.error("Failed to fetch leaderboard for claiming")
      return
    }

    // Trigger the claim
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
    disabled = false
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
        disabled && "opacity-50 cursor-not-allowed"
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
          <ActionButton onClick={handleClaim} disabled={isPending}>
            {isPending
              ? "Claiming..."
              : `Claim ${item.userAction.amount} ${item.userAction.tokenSymbol}`
            }
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
