import {
  CASINO_GAME_TYPE,
  casinoChainById,
  chainById,
  chainNativeCurrencyToToken,
  WeightedGame,
  type WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useState } from "react"
import { formatGwei, type Hex, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../context/chainContext"
import { useTokenContext } from "../context/tokenContext"
import {
  BetStatus,
  GameResult,
  HistoryEntry,
  Theme,
  TokenWithImage,
  WeightedGameDefinition,
} from "../types/types"

import { useGameHistory } from "./useGameHistory"
import { useHouseEdge } from "./useHouseEdge"
import { useIsGamePaused } from "./useIsGamePaused"
import { usePlaceWeightedGameBet } from "./usePlaceWeightedGameBet"
import { useTokenAllowance } from "./useTokenAllowance"

interface UseWeightedGameLogicProps<
  T extends { game: CASINO_GAME_TYPE.WHEEL; choice: WeightedGameConfiguration },
> {
  gameDefinition: WeightedGameDefinition<T>
  backgroundImage: string
}

interface UseWeightedGameLogicResult {
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
  currentConfig: WeightedGameConfiguration | null
  setCurrentConfig: (config: WeightedGameConfiguration) => void
  betStatus: BetStatus
  gameResult: GameResult | null
  resetBetState: () => void
  vrfFees: bigint
  formattedVrfFees: number | string
  gasPrice: string
  targetPayoutAmount: bigint
  formattedNetMultiplier: number
  grossMultiplier: number
  houseEdge: number
  isInGameResultState: boolean
  isGamePaused: boolean
  nativeCurrencySymbol: string
  themeSettings: {
    theme: Theme
    backgroundImage: string
  }
  handlePlayButtonClick: () => Promise<void>
  handleBetAmountChange: (amount: bigint | undefined) => void
  needsTokenApproval: boolean
  isApprovePending: boolean
  isApproveConfirming: boolean
  isRefetchingAllowance: boolean
  approveError: unknown
}

export function useWeightedGameLogic<
  T extends { game: CASINO_GAME_TYPE.WHEEL; choice: WeightedGameConfiguration },
>({ gameDefinition, backgroundImage }: UseWeightedGameLogicProps<T>): UseWeightedGameLogicResult {
  const { gameType } = gameDefinition

  const { isConnected: isWalletConnected, address } = useAccount()
  const { gameHistory, refreshHistory } = useGameHistory(gameType)
  const { areChainsSynced, appChainId } = useChain()

  const { selectedToken } = useTokenContext()

  const token: TokenWithImage = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "",
      }
    )
  }, [selectedToken, appChainId])

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
  const [currentConfig, setCurrentConfig] = useState<WeightedGameConfiguration | null>(null)

  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const configs = WeightedGame.getChoiceInputs(appChainId, gameType, undefined, undefined)

        const defaultConfig = configs.find(
          (c) => c.config.configId === gameDefinition.defaultConfigId,
        )
        if (defaultConfig) {
          setCurrentConfig(defaultConfig.config)
        } else if (configs.length > 0) {
          setCurrentConfig(configs[0].config)
        }
      } catch (error) {
        console.error("Failed to load weighted game configuration:", error)
      }
    }

    loadDefaultConfig()
  }, [appChainId, gameType, gameDefinition.defaultConfigId])

  const { placeBet, betStatus, gameResult, resetBetState, vrfFees, formattedVrfFees, gasPrice } =
    usePlaceWeightedGameBet(gameType, token, refetchBalance)

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

  const { netPayout, formattedNetMultiplier, grossMultiplier } = useMemo(() => {
    if (!currentConfig || !betAmount) {
      return {
        netPayout: 0n,
        formattedNetMultiplier: 0,
        grossMultiplier: 0,
      }
    }

    const maxMultiplier = Math.max(...currentConfig.multipliers.map((m) => Number(m)))
    const grossMultiplier = maxMultiplier
    const netMultiplier = grossMultiplier * (1 - houseEdge / 10000)
    const netPayout = (betAmount * BigInt(Math.floor(netMultiplier))) / BigInt(10000)

    return {
      netPayout,
      formattedNetMultiplier: netMultiplier / 10000,
      grossMultiplier,
    }
  }, [currentConfig, betAmount, houseEdge])

  const targetPayoutAmount = netPayout || 0n

  const isInGameResultState = betStatus === "success" && !!gameResult
  const nativeCurrencySymbol = chainById[appChainId].nativeCurrency.symbol

  const themeSettings = {
    theme: "system" as Theme,
    backgroundImage,
  }

  const isApprovePending = approveWriteWagmiHook.isPending
  const isApproveConfirming = approveWaitingWagmiHook.isLoading
  const isRefetchingAllowance = allowanceReadWagmiHook.isRefetching
  const approveError = approveWriteWagmiHook.error

  const handleBetAmountChange = (amount: bigint | undefined) => {
    setBetAmount(amount)
  }

  const handlePlayButtonClick = async () => {
    if (!currentConfig) {
      console.error("No configuration selected")
      return
    }

    if (approveWriteWagmiHook.error) {
      resetApprovalState()
      if (needsTokenApproval) {
        await approveToken()
      }
      return
    }

    if (betStatus === "error") {
      resetBetState()
    } else if (isInGameResultState) {
      resetBetState()
      return
    }

    if (!isWalletConnected || !betAmount || betAmount <= 0n) {
      return
    }

    if (needsTokenApproval) {
      await approveToken()
    } else {
      placeBet(betAmount, currentConfig)
    }
  }

  return {
    isWalletConnected,
    address,
    balance: balance?.value || 0n,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    refetchBalance,
    betAmount,
    setBetAmount,
    currentConfig,
    setCurrentConfig,
    betStatus,
    gameResult,
    resetBetState,
    vrfFees,
    formattedVrfFees,
    gasPrice: formatGwei(BigInt(gasPrice)),
    targetPayoutAmount,
    formattedNetMultiplier,
    grossMultiplier,
    houseEdge,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    needsTokenApproval,
    isApprovePending,
    isApproveConfirming,
    isRefetchingAllowance,
    approveError,
  }
}
