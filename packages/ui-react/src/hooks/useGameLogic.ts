import {
  CASINO_GAME_TYPE,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import React, { useMemo, useState } from "react"
import { formatGwei, type Hex, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../context/chainContext"
import { useTokenContext } from "../context/tokenContext"
import {
  BetStatus,
  GameChoice,
  GameDefinition,
  GameResult,
  HistoryEntry,
  Theme,
  TokenWithImage,
} from "../types/types"
import { useBetCalculations } from "./useBetCalculations"
import { useGameHistory } from "./useGameHistory"
import { useHouseEdge } from "./useHouseEdge"
import { useIsGamePaused } from "./useIsGamePaused"

import { usePlaceBet } from "./usePlaceBet"
import { useTokenAllowance } from "./useTokenAllowance"

interface UseGameLogicProps<T extends GameChoice> {
  gameDefinition?: GameDefinition<T>
  backgroundImage: string
}

interface UseGameLogicResult<T extends GameChoice = GameChoice> {
  isWalletConnected: boolean
  address: string | undefined
  balance: bigint
  token: TokenWithImage
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
  isConfigurationLoading: boolean
  formattedVrfFees: number | string
  gasPrice: string
  targetPayoutAmount: bigint
  formattedNetMultiplier: number
  grossMultiplier: number // BP
  houseEdge: number // BP
  isInGameResultState: boolean
  isGamePaused: boolean
  nativeCurrencySymbol: string
  themeSettings: {
    theme: Theme
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
  needsTokenApproval: boolean
  isApprovePending: boolean
  isApproveConfirming: boolean
  approveToken: () => Promise<void>
  isRefetchingAllowance: boolean
  approveError: Error | null
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
export function useGameLogic<T extends GameChoice>({
  gameDefinition,
  backgroundImage,
}: UseGameLogicProps<T>): UseGameLogicResult<T> {
  // Track configuration loading state
  const isConfigurationLoading = !gameDefinition

  const { isConnected: isWalletConnected, address } = useAccount()

  // Only fetch game history if we have a valid game definition
  const { gameHistory, refreshHistory } = useGameHistory(
    gameDefinition?.gameType || CASINO_GAME_TYPE.DICE
  )
  const { areChainsSynced, appChainId } = useChain()

  const { selectedToken } = useTokenContext()

  // Determine the effective token to use - memoize to prevent unnecessary re-renders
  const token: TokenWithImage = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "", // Fallback for native currency - user should configure this
      }
    )
  }, [selectedToken, appChainId])

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: token.address === zeroAddress ? undefined : (token.address as Hex),
  })

  // Only fetch house edge if we have a valid game definition
  const { houseEdge } = useHouseEdge({
    game: gameDefinition?.gameType || CASINO_GAME_TYPE.DICE,
    token,
  })

  // Only check if game is paused if we have a valid game definition
  const { isPaused: isGamePaused } = useIsGamePaused({
    game: gameDefinition?.gameType || CASINO_GAME_TYPE.DICE,
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T>(() => {
    // Only set default selection if we have a valid game definition
    return gameDefinition?.defaultSelection as T
  })

  // Update selection when gameDefinition changes
  React.useEffect(() => {
    if (gameDefinition?.defaultSelection) {
      setSelection(gameDefinition.defaultSelection as T)
    }
  }, [gameDefinition])

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceBet(
      gameDefinition?.gameType || CASINO_GAME_TYPE.DICE,
      token,
      refetchBalance,
      gameDefinition
    )

  const gameContractAddress = gameDefinition
    ? casinoChainById[appChainId]?.contracts.games[gameDefinition.gameType]?.address
    : undefined

  const {
    needsApproval: needsTokenApproval,
    approveWriteWagmiHook,
    approveWaitingWagmiHook,
    allowanceReadWagmiHook,
    approve: approveToken,
    resetApprovalState,
  } = useTokenAllowance({
    token,
    spender: gameContractAddress || zeroAddress,
    amount: betAmount || 0n,
    enabled: !!gameContractAddress && !!betAmount && betAmount > 0n,
  })

  // Only perform bet calculations if we have a valid game definition
  const { netPayout, formattedNetMultiplier, grossMultiplier } = useBetCalculations({
    selection,
    houseEdge,
    betAmount,
    betCount: 1, // TODO #64: Use the real bet count
    gameDefinition,
    enabled: !isConfigurationLoading,
  })

  const isInGameResultState = !!gameResult
  const nativeCurrencySymbol = chainById[appChainId].nativeCurrency.symbol

  const themeSettings = {
    theme: "system" as const,
    customTheme: undefined,
    backgroundImage,
  }

  const handlePlayButtonClick = async () => {
    // Reset approval error if there is one
    if (approveWriteWagmiHook.error) {
      resetApprovalState()
      // Try approval again
      if (needsTokenApproval) {
        await approveToken()
      }
      return
    }

    if (betStatus === "error") {
      resetBetState()
      if (isWalletConnected && betAmount && betAmount > 0n) {
        if (needsTokenApproval) {
          await approveToken()
        } else {
          placeBet(betAmount, selection)
        }
      }
    } else if (isInGameResultState) {
      resetBetState()
    } else if (isWalletConnected && betAmount && betAmount > 0n) {
      if (needsTokenApproval) {
        await approveToken()
      } else {
        placeBet(betAmount, selection)
      }
    }
  }

  const handleBetAmountChange = (amount: bigint | undefined) => {
    setBetAmount(amount)
    // Reset error state when user changes bet amount
    if (betStatus === "error" || betStatus === "waiting-error" || betStatus === "internal-error") {
      resetBetState()
    }
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
    houseEdge,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    placeBet,
    needsTokenApproval,
    isApprovePending: approveWriteWagmiHook.isPending,
    isApproveConfirming: approveWaitingWagmiHook.isLoading,
    approveToken,
    isRefetchingAllowance: allowanceReadWagmiHook.isRefetching,
    approveError: approveWriteWagmiHook.error || approveWaitingWagmiHook.error,
    isConfigurationLoading,
  }
}
