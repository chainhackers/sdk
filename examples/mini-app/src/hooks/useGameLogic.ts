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
import { BetStatus, GameResult } from "../types"
import { useGameCalculations } from "./useGameCalculations"
import { HistoryEntry, useGameHistory } from "./useGameHistory"
import { useHouseEdge } from "./useHouseEdge"
import { usePlaceBet } from "./usePlaceBet"

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
  multiplier: number
  isInGameResultState: boolean
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

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T>(defaultSelection)

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceBet(gameType, refetchBalance)

  const { targetPayoutAmount, multiplier } = useGameCalculations({
    gameType,
    selection,
    houseEdge,
    betAmount,
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
    targetPayoutAmount,
    multiplier,
    isInGameResultState,
    nativeCurrencySymbol,
    themeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    placeBet,
  }
}
