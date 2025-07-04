import {
  CASINO_GAME_TYPE,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
  KenoConfiguration,
} from "@betswirl/sdk-core"
import React, { useState } from "react"
import { formatGwei, type Hex, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../context/chainContext"
import { useTokenContext } from "../context/tokenContext"
import { BetStatus, GameChoice, GameResult, HistoryEntry, TokenWithImage } from "../types/types"
import { useBetCalculations } from "./useBetCalculations"
import { useGameHistory } from "./useGameHistory"
import { useHouseEdge } from "./useHouseEdge"
import { useIsGamePaused } from "./useIsGamePaused"
import { useKenoConfiguration } from "./useKenoConfiguration"
import { usePlaceBet } from "./usePlaceBet"
import { useTokenAllowance } from "./useTokenAllowance"

interface UseGameLogicProps {
  gameType: CASINO_GAME_TYPE
  defaultSelection: GameChoice
  backgroundImage: string
}

interface UseGameLogicResult {
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
  selection: GameChoice
  setSelection: (selection: GameChoice) => void
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
  kenoConfig?: KenoConfiguration
  kenoConfigLoading?: boolean
  kenoConfigError?: Error | null
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
  placeBet: (betAmount: bigint, choice: GameChoice) => void
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
export function useGameLogic({
  gameType,
  defaultSelection,
  backgroundImage,
}: UseGameLogicProps): UseGameLogicResult {
  const { isConnected: isWalletConnected, address } = useAccount()
  const { gameHistory, refreshHistory } = useGameHistory(gameType)
  const { areChainsSynced, appChainId } = useChain()

  const { selectedToken } = useTokenContext()

  // Determine the effective token to use
  const token: TokenWithImage = selectedToken || {
    ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
    image: "", // Fallback for native currency - user should configure this
  }

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: token.address === zeroAddress ? undefined : (token.address as Hex),
  })
  const { houseEdge } = useHouseEdge({
    game: gameType,
    token,
  })
  const { isPaused: isGamePaused } = useIsGamePaused({
    game: gameType,
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selection, setSelection] = useState<GameChoice>(defaultSelection)

  const kenoConfiguration = useKenoConfiguration({
    token,
    query: { enabled: gameType === CASINO_GAME_TYPE.KENO },
  })

  const kenoConfigResult =
    gameType === CASINO_GAME_TYPE.KENO
      ? kenoConfiguration
      : { config: undefined, loading: false, error: null }

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceBet(gameType, token, refetchBalance, kenoConfigResult.config)

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
    kenoConfig: kenoConfigResult.config,
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
    kenoConfig: kenoConfigResult.config,
    kenoConfigLoading: kenoConfigResult.loading,
    kenoConfigError: kenoConfigResult.error,
  }
}
