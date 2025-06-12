import { useMemo } from "react"
import { BetStatus } from "../../../types"

export function useGameControls(
  isWalletConnected: boolean,
  betStatus: BetStatus | null,
  isInGameResultState: boolean,
) {
  return useMemo(
    () =>
      !isWalletConnected ||
      betStatus === "pending" ||
      betStatus === "loading" ||
      betStatus === "rolling" ||
      isInGameResultState,
    [isWalletConnected, betStatus, isInGameResultState],
  )
}
