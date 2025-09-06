import type { CasinoChainId, Leaderboard } from "@betswirl/sdk-core"
import { useCallback, useEffect } from "react"
import { useClaimLeaderboardRewards } from "../../hooks/useClaimLeaderboardRewards"
import { cn } from "../../lib/utils"
import type { LeaderboardUserAction, PlayNowEvent } from "../../types/types"
import { useGameFrameContext } from "../game/GameFrame"
import { Button } from "../ui/button"

interface LeaderboardActionButtonProps {
  leaderboard: Leaderboard
  userAction: LeaderboardUserAction
  onClaimSuccess?: () => void
  onPlayNow?: (event: PlayNowEvent) => void
  className?: string
}

export function LeaderboardActionButton({
  leaderboard,
  userAction,
  onClaimSuccess,
  onPlayNow,
  className,
}: LeaderboardActionButtonProps) {
  const { claim, isPending, isSuccess, isError } = useClaimLeaderboardRewards()
  const { setIsLeaderboardSheetOpen } = useGameFrameContext()

  useEffect(() => {
    if (isSuccess && onClaimSuccess) {
      onClaimSuccess()
    }
  }, [isSuccess, onClaimSuccess])

  const handleClaim = useCallback(async () => {
    claim({ leaderboard })
  }, [claim, leaderboard])

  const handlePlayNow = useCallback(() => {
    if (leaderboard.casinoRules && onPlayNow) {
      const playNowEvent: PlayNowEvent = {
        chainId: leaderboard.chainId as CasinoChainId,
        games: leaderboard.casinoRules.games,
        tokens: leaderboard.casinoRules.tokens,
      }
      onPlayNow(playNowEvent)
    }
    setIsLeaderboardSheetOpen(false)
  }, [leaderboard, onPlayNow, setIsLeaderboardSheetOpen])

  const buttonClassName = cn(
    "bg-primary hover:bg-primary/90",
    "text-white font-semibold",
    "rounded-[8px] h-[32px] flex-1",
    "text-[12px] leading-[20px]",
    className,
  )

  switch (userAction.type) {
    case "play":
      return (
        <Button onClick={handlePlayNow} className={buttonClassName}>
          Play now
        </Button>
      )

    case "claim":
      return (
        <Button
          onClick={handleClaim}
          disabled={isPending}
          className={cn(buttonClassName, isPending && "opacity-50 cursor-not-allowed")}
        >
          {isPending
            ? "Claiming..."
            : isError
              ? "Retry claim"
              : `Claim ${userAction.amount} ${userAction.tokenSymbol}`}
        </Button>
      )

    case "claimed":
      return (
        <Button disabled={true} className={cn(buttonClassName, "opacity-50 cursor-not-allowed")}>
          {`Claimed ${userAction.amount} ${userAction.tokenSymbol}`}
        </Button>
      )

    case "overview":
      return null

    default:
      return null
  }
}
