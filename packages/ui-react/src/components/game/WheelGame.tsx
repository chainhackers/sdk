import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  formatRawAmount,
  WeightedGame,
  type WeightedGameConfiguration,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useRef } from "react"
import wheelBackground from "../../assets/game/game-background.jpg"
import { useChain } from "../../context/chainContext"
import { useGameLogic } from "../../hooks/useGameLogic"
import { GameDefinition, TokenWithImage } from "../../types/types"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"

import { WheelController, WheelGameControls } from "./WheelGameControls"
import { useHouseEdge } from "../../hooks/useHouseEdge"
import { useTokenContext } from "../../context/tokenContext"

export interface WheelGameProps extends BaseGameProps {}

export function WheelGame({
  theme = "system",
  customTheme,
  backgroundImage = wheelBackground,
  ...props
}: WheelGameProps) {
  const gameFrameRef = useRef<HTMLDivElement>(null)
  const wheelControllerRef = useRef<WheelController>(null)

  const { selectedToken: token } = useTokenContext()
  const { appChainId } = useChain()
  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.WHEEL,
    token,
  })

  // Create game definition dynamically based on loaded config
  const wheelGameDefinition = useMemo(() => {
    const choiceInputs = WeightedGame.getChoiceInputs(appChainId, CASINO_GAME_TYPE.WHEEL, houseEdge)
    console.log({ choiceInputs, houseEdge })

    if (!choiceInputs || choiceInputs.length === 0) return undefined

    const wheelConfig = choiceInputs[0]?.config
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
  }, [appChainId, houseEdge])

  // Always call useGameLogic - it now handles configuration loading internally
  const {
    isWalletConnected,
    balance,
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

  const wheelConfig = wheelGameDefinition?.defaultSelection.choice

  const tooltipContent = useMemo(() => {
    if (!wheelConfig || !betAmount || houseEdge === undefined) return undefined

    const uniqueOutputs = WeightedGame.getUniqueOutputs(wheelConfig, houseEdge)
    const content: Record<number, { chance?: string; profit?: number; token: TokenWithImage }> = {}

    uniqueOutputs.forEach((output) => {
      const profit = (Number(betAmount) * output.formattedNetMultiplier) / 10 ** token.decimals
      content[output.multiplier] = {
        chance: `${output.chanceToWin}%`,
        profit: profit,
        token,
      }
    })

    return content
  }, [wheelConfig, betAmount, token, houseEdge])

  // Show loading state while configuration is being fetched
  if (isConfigurationLoading || !wheelGameDefinition || !wheelConfig) {
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
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={wheelControllerRef.current?.isSpinning ? null : gameResult}
          currency={token.symbol}
        />
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
        isGamePaused={isGamePaused || !!wheelControllerRef.current?.isSpinning}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
