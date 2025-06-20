import { useMemo } from "react"
import { BetStatus } from "../../../types/types"

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
