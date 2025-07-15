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
import { useWeightedGameLogic } from "../../hooks/useWeightedGameLogic"
import { WeightedGameDefinition } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"

import { WheelController, WheelGameControls } from "./WheelGameControls"

const DEFAULT_CONFIG_ID = 0
const RESULT_DISPLAY_DELAY = 2500

const wheelGameDefinition: WeightedGameDefinition<{
  game: CASINO_GAME_TYPE.WHEEL
  choice: WeightedGameConfiguration
}> = {
  gameType: CASINO_GAME_TYPE.WHEEL,
  defaultConfigId: DEFAULT_CONFIG_ID,
  getMultiplier: (config) => {
    const maxMultiplier = Math.max(...config.multipliers.map((m) => Number(m)))
    return maxMultiplier
  },
  encodeInput: (config) => WeightedGame.encodeInput(config.configId),
  getWinChancePercent: (config) => {
    return config.multipliers.map((_, index) => WeightedGame.getWinChancePercent(config, index))
  },
}

export interface WheelGameProps extends BaseGameProps {}

export function WheelGame({
  theme = "system",
  customTheme,
  backgroundImage = wheelBackground,
  ...props
}: WheelGameProps) {
  const wheelControllerRef = useRef<WheelController>(null)

  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    currentConfig,
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
  } = useWeightedGameLogic({
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
    if (!currentConfig || !betAmount) return undefined

    const uniqueOutputs = WeightedGame.getUniqueOutputs(currentConfig, 0)
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
  }, [currentConfig, betAmount, token])

  if (!currentConfig) {
    return (
      <GameFrame themeSettings={themeSettings} {...props} variant="wheel">
        <GameFrame.Header title="Wheel" connectWalletButton={<GameConnectWallet />} />
        <GameFrame.GameArea variant="wheel">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">Loading wheel configuration...</div>
          </div>
        </GameFrame.GameArea>
      </GameFrame>
    )
  }

  return (
    <GameFrame themeSettings={themeSettings} {...props} variant="wheel">
      <GameFrame.Header title="Wheel" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="wheel">
        <GameFrame.InfoButton
          winChance={wheelGameDefinition.getWinChancePercent?.(currentConfig)?.[0] || 0}
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
            config={currentConfig}
            theme={theme}
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
        isGamePaused={isGamePaused}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
