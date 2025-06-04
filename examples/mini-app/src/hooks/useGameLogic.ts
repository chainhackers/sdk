import React, { useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatGwei } from "viem"
import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  DiceNumber,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import { useGameHistory, HistoryEntry } from "./useGameHistory"
import { usePlaceBet } from "./usePlaceBet"
import { useChain } from "../context/chainContext"
import { useHouseEdge } from "./useHouseEdge"
import { useGameCalculations } from "./useGameCalculations"
import { BetStatus, GameResult } from "../types"

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
  tokenDecimals: number
  areChainsSynced: boolean
  gameHistory: HistoryEntry[]
  refreshHistory: () => void
  betAmount: bigint | undefined
  setBetAmount: (amount: bigint | undefined) => void
  selection: T
  setSelection: (selection: T) => void
  betStatus: BetStatus
  gameResult: GameResult | null
  resetBetState: () => void
  formattedVrfFees: number | string
  gasPrice: string
  targetPayoutAmount: bigint
  multiplier: string
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
  const { data: balance } = useBalance({ address })
  const { areChainsSynced, appChainId } = useChain()

  const { houseEdge } = useHouseEdge({
    game: gameType,
    token: chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T>(defaultSelection)

  const {
    placeBet,
    betStatus,
    gameResult,
    resetBetState,
    formattedVrfFees,
    gasPrice,
  } = usePlaceBet(gameType)

  const { targetPayoutAmount, multiplier } = useGameCalculations({
    gameType,
    selection,
    houseEdge,
    betAmount,
  })

  const isInGameResultState = !!gameResult
  const tokenDecimals = balance?.decimals ?? 18
  const nativeCurrencySymbol = chainById[appChainId].nativeCurrency.symbol

  const themeSettings = {
    theme: "system" as const,
    customTheme: undefined,
    backgroundImage,
  }

  const handlePlayButtonClick = () => {
    if (betStatus === "error" || isInGameResultState) {
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
    tokenDecimals,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    setBetAmount,
    selection,
    setSelection,
    betStatus,
    gameResult,
    resetBetState,
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
