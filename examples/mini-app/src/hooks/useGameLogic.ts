import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  DiceNumber,
  Token,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import React, { useState } from "react"
import { formatGwei } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../context/chainContext"
import { BetStatus, GameResult, HistoryEntry } from "../types/types"
import { useGameHistory } from "./useGameHistory"
import { useHouseEdge } from "./useHouseEdge"
import { useIsGamePaused } from "./useIsGamePaused"
import { usePlaceBet } from "./usePlaceBet"
import { useBetCalculations } from "./useBetCalculations"

type GameSelection = COINTOSS_FACE | DiceNumber

interface UseGameLogicProps<T extends GameSelection> {
  gameType: CASINO_GAME_TYPE
  defaultSelection: T
  backgroundImage: string
}

interface UseGameLogicResult<T extends GameSelection> {
  isWalletConnected: boolean
  address: string | undefined
  balance: bigint
  token: Token
  areChainsSynced: boolean
  gameHistory: HistoryEntry[]
  refreshHistory: () => void
  refetchBalance: () => void
  betAmount: bigint | undefined
  setBetAmount: (amount: bigint | undefined) => void
  selection: T
  setSelection: (selection: T) => void
  betStatus: BetStatus
  gameResult: GameResult | null
  resetBetState: () => void
  vrfFees: bigint
  formattedVrfFees: number | string
  gasPrice: string
  targetPayoutAmount: bigint
  formattedNetMultiplier: number
  grossMultiplier: number // BP
  isInGameResultState: boolean
  isGamePaused: boolean
  nativeCurrencySymbol: string
  themeSettings: {
    theme: "light" | "dark" | "system"
    customTheme?: {
      "--primary"?: string
      "--play-btn-font"?: string
      "--game-window-overlay"?: string
    } & React.CSSProperties
    backgroundImage: string
  }
  handlePlayButtonClick: () => void
  handleBetAmountChange: (amount: bigint | undefined) => void
  placeBet: (betAmount: bigint, choice: T) => void
}

/**
 * Centralizes casino game logic including bet placement, result tracking, and UI state.
 * Manages the complete game flow from selection to payout calculation.
 *
 * @param gameType - Type of casino game (coin toss or dice)
 * @param defaultSelection - Initial game selection
 * @param backgroundImage - Game background image URL
 * @returns Complete game state and control functions
 *
 * @example
 * ```ts
 * const gameLogic = useGameLogic({
 *   gameType: CASINO_GAME_TYPE.DICE,
 *   defaultSelection: 1,
 *   backgroundImage: '/assets/dice-bg.png'
 * })
 *
 * // Place bet when ready
 * gameLogic.handlePlayButtonClick()
 * ```
 */
export function useGameLogic<T extends GameSelection>({
  gameType,
  defaultSelection,
  backgroundImage,
}: UseGameLogicProps<T>): UseGameLogicResult<T> {
  const { isConnected: isWalletConnected, address } = useAccount()
  const { gameHistory, refreshHistory } = useGameHistory(gameType)
  const { data: balance, refetch: refetchBalance } = useBalance({ address })
  const { areChainsSynced, appChainId } = useChain()

  const token = chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency)
  const { houseEdge } = useHouseEdge({
    game: gameType,
    token,
  })
  const { isPaused: isGamePaused } = useIsGamePaused({
    game: gameType,
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T>(defaultSelection)

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceBet(gameType, refetchBalance)

  const { netPayout, formattedNetMultiplier, grossMultiplier } = useBetCalculations({
    gameType,
    selection,
    houseEdge,
    betAmount,
    betCount: 1, // TODO #64: Use the real bet count
  })

  const isInGameResultState = !!gameResult
  const nativeCurrencySymbol = chainById[appChainId].nativeCurrency.symbol

  const themeSettings = {
    theme: "system" as const,
    customTheme: undefined,
    backgroundImage,
  }

  const handlePlayButtonClick = () => {
    if (betStatus === "error") {
      resetBetState()
      if (isWalletConnected && betAmount && betAmount > 0n) {
        placeBet(betAmount, selection)
      }
    } else if (isInGameResultState) {
      resetBetState()
    } else if (isWalletConnected && betAmount && betAmount > 0n) {
      placeBet(betAmount, selection)
    }
  }

  const handleBetAmountChange = (amount: bigint | undefined) => {
    setBetAmount(amount)
  }

  return {
    isWalletConnected,
    address,
    balance: balance?.value ?? 0n,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    refetchBalance,
    betAmount,
    setBetAmount,
    selection,
    setSelection,
    betStatus,
    gameResult,
    resetBetState,
    vrfFees,
    formattedVrfFees,
    gasPrice: formatGwei(gasPrice),
    targetPayoutAmount: netPayout,
    formattedNetMultiplier: formattedNetMultiplier,
    grossMultiplier,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    placeBet,
  }
}
