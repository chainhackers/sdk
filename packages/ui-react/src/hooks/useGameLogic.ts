import {
  CASINO_GAME_TYPE,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import React, { useEffect, useMemo, useState } from "react"
import { formatGwei, zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { useBalanceRefresh, useBalances } from "../context/BalanceContext"
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
  const defaultGameDefinition: GameDefinition<T> = useMemo(
    () => ({
      gameType: CASINO_GAME_TYPE.DICE,
      defaultSelection: { game: CASINO_GAME_TYPE.DICE, choice: 20 } as T,
      getMultiplier: () => 1,
      encodeInput: () => 0,
    }),
    [],
  )

  const effectiveGameDefinition = gameDefinition || defaultGameDefinition
  const { gameType, defaultSelection } = effectiveGameDefinition

  const { isConnected: isWalletConnected, address } = useAccount()
  const { data: gameHistoryData, refetch: refreshHistory } = useGameHistory({
    gameType,
    filter: {},
  })
  const { areChainsSynced, appChainId } = useChain()

  const { selectedToken } = useTokenContext()
  const { getBalance, refetch: refetchBalance } = useBalances()
  const triggerBalanceRefresh = useBalanceRefresh()

  // Determine the effective token to use - memoize to prevent unnecessary re-renders
  const token: TokenWithImage = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "", // Fallback for native currency - user should configure this
      }
    )
  }, [selectedToken, appChainId])

  // Get balance from BalanceContext
  const balance = getBalance(token.address) || 0n
  const { houseEdge } = useHouseEdge({
    game: gameType,
    token,
  })
  const { isPaused: isGamePaused } = useIsGamePaused({
    game: gameType,
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<T>(defaultSelection as T)

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceBet(gameType, token, triggerBalanceRefresh, effectiveGameDefinition)

  // Reset bet state when chain or token changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to reset bet state when chain or token changes
  useEffect(() => {
    resetBetState()
  }, [appChainId, token.address, resetBetState])

  const gameContractAddress = casinoChainById[appChainId]?.contracts.games[gameType]?.address

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

  const { netPayout, formattedNetMultiplier, grossMultiplier } = useBetCalculations({
    selection,
    houseEdge,
    betAmount,
    betCount: 1, // TODO #64: Use the real bet count
    gameDefinition: effectiveGameDefinition,
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
    balance,
    token,
    areChainsSynced,
    gameHistory: gameHistoryData?.gameHistory ?? [],
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
  }
}
