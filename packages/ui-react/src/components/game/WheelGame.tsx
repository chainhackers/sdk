import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  formatRawAmount,
  WeightedGame,
  type WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useCallback, useEffect, useMemo, useRef } from "react"
import wheelBackground from "../../assets/game/game-background.jpg"
import { useDelayedGameResult } from "../../hooks/useDelayedGameResult"
import { useGameLogic } from "../../hooks/useGameLogic"
import { useWeightedGameConfiguration } from "../../hooks/useWeightedGameConfiguration"
import { GameDefinition } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"

import { WheelController, WheelGameControls } from "./WheelGameControls"

const DEFAULT_CONFIG_ID = 0
const RESULT_DISPLAY_DELAY = 2500

export interface WheelGameProps extends BaseGameProps {}

export function WheelGame({
  theme = "system",
  customTheme,
  backgroundImage = wheelBackground,
  ...props
}: WheelGameProps) {
  const gameFrameRef = useRef<HTMLDivElement>(null)
  const wheelControllerRef = useRef<WheelController>(null)

  // Load wheel configuration from blockchain - hook auto-detects game type
  const { config: wheelConfig } = useWeightedGameConfiguration({
    configId: DEFAULT_CONFIG_ID,
    query: { enabled: true },
  })

  // Create game definition dynamically based on loaded config
  const wheelGameDefinition = useMemo(() => {
    if (!wheelConfig) return undefined

    return {
      gameType: CASINO_GAME_TYPE.WHEEL,
      defaultSelection: { game: CASINO_GAME_TYPE.WHEEL, choice: wheelConfig },
      getMultiplier: (config: WeightedGameConfiguration) => {
        if (!config?.multipliers) return 0
        const maxMultiplier = Math.max(...config.multipliers.map((m) => Number(m)))
        return maxMultiplier
      },
      encodeInput: (config: WeightedGameConfiguration) => {
        if (!config) return 0
        return WeightedGame.encodeInput(config.configId)
      },
      getWinChancePercent: (config: WeightedGameConfiguration) => {
        if (!config?.multipliers) return []
        return config.multipliers.map((_, index) => WeightedGame.getWinChancePercent(config, index))
      },
      formatDisplayResult: (rolledResult, config) => {
        if (rolledResult.game !== CASINO_GAME_TYPE.WHEEL || !config?.multipliers) {
          return ""
        }
        const winningIndex = rolledResult.rolled as number
        const multiplier = config.multipliers[winningIndex]
        const formattedMultiplier = (Number(multiplier) / 10000).toFixed(2)
        return `${formattedMultiplier}x`
      },
    } as GameDefinition<{
      game: CASINO_GAME_TYPE.WHEEL
      choice: WeightedGameConfiguration
    }>
  }, [wheelConfig])

  // Always call useGameLogic - it now handles configuration loading internally
  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    betStatus,
    gameResult,
    vrfFees,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    grossMultiplier,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    needsTokenApproval,
    isApprovePending,
    isApproveConfirming,
    isRefetchingAllowance,
    approveError,
    isConfigurationLoading,
  } = useGameLogic({
    gameDefinition: wheelGameDefinition,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const { delayedGameResult, handleSpinComplete } = useDelayedGameResult({
    gameResult,
    betStatus,
    delay: RESULT_DISPLAY_DELAY,
  })

  // Start endless spin when bet status becomes 'rolling'
  useEffect(() => {
    if (betStatus === "rolling") {
      wheelControllerRef.current?.startEndlessSpin()
    }
  }, [betStatus])

  // Stop spin with result when gameResult becomes available
  useEffect(() => {
    if (gameResult && gameResult.rolled.game === CASINO_GAME_TYPE.WHEEL) {
      const winningSectorIndex = gameResult.rolled.rolled as number
      wheelControllerRef.current?.spinWheelWithResult(winningSectorIndex)
    }
  }, [gameResult])

  const handleAnimationAndResultTasks = useCallback(() => {
    handleSpinComplete()
  }, [handleSpinComplete])

  const tooltipContent = useMemo(() => {
    if (!wheelConfig || !betAmount) return undefined

    const uniqueOutputs = WeightedGame.getUniqueOutputs(wheelConfig, 0)
    const content: Record<number, { chance?: string; profit?: number; token: typeof token }> = {}

    uniqueOutputs.forEach((output) => {
      const profit = (Number(betAmount) * output.formattedNetMultiplier) / 10 ** token.decimals
      content[output.multiplier] = {
        chance: `${output.chanceToWin}%`,
        profit: profit,
        token: token,
      }
    })

    return content
  }, [wheelConfig, betAmount, token])

  // Show loading state while configuration is being fetched
  if (isConfigurationLoading || !wheelConfig) {
    return (
      <GameFrame ref={gameFrameRef} themeSettings={themeSettings} {...props} variant="wheel">
        <GameFrame.Header title="Wheel" connectWalletButton={<GameConnectWallet />} />
        <GameFrame.GameArea variant="wheel">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-on-surface-variant border-t-transparent mx-auto mb-4" />
              <div>Loading wheel configuration...</div>
            </div>
          </div>
        </GameFrame.GameArea>
      </GameFrame>
    )
  }

  return (
    <GameFrame ref={gameFrameRef} themeSettings={themeSettings} {...props} variant="wheel">
      <GameFrame.Header title="Wheel" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="wheel">
        <GameFrame.InfoButton
          winChance={(() => {
            const chances = wheelGameDefinition?.getWinChancePercent?.(wheelConfig)
            if (Array.isArray(chances)) {
              return Math.max(...chances)
            }
            return chances || 0
          })()}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <WheelGameControls
            ref={wheelControllerRef}
            config={wheelConfig}
            theme={theme}
            parent={gameFrameRef}
            tooltipContent={tooltipContent}
            onSpinComplete={handleAnimationAndResultTasks}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={delayedGameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.WHEEL}
        betCount={1}
        grossMultiplier={grossMultiplier}
        balance={balance}
        isConnected={isWalletConnected}
        token={token}
        betStatus={betStatus}
        betAmount={betAmount}
        vrfFees={vrfFees}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        areChainsSynced={areChainsSynced}
        isGamePaused={isGamePaused || (!delayedGameResult && betStatus === "success")}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
