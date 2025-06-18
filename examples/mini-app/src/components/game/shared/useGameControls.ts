import { BetStatus } from "@/types/types"
import { useMemo } from "react"

export function useGameControls(
  isWalletConnected: boolean,
  betStatus: BetStatus,
  isInGameResultState: boolean,
  isGamePaused: boolean,
) {
  return useMemo(
    () =>
      !isWalletConnected ||
      betStatus === "pending" ||
      betStatus === "loading" ||
      betStatus === "rolling" ||
      isInGameResultState ||
      isGamePaused,
    [isWalletConnected, betStatus, isInGameResultState, isGamePaused],
  )
}
