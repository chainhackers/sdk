import kenoBackground from "../../assets/game/game-background.jpg?no-inline"

import { CASINO_GAME_TYPE, FORMAT_TYPE, KenoBall, formatRawAmount } from "@betswirl/sdk-core"
import { useEffect, useState } from "react"
import { useGameLogic } from "../../hooks/useGameLogic"
import { useKenoMultipliers } from "../../hooks/useKenoMultipliers"
import { GameFrame } from "./GameFrame"
import { KenoGameControls } from "./KenoGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_KENO_SELECTION: KenoBall[] = []

export interface KenoGameProps extends BaseGameProps {}

export function KenoGame({
  theme = "system",
  customTheme,
  backgroundImage = kenoBackground,
  ...props
}: KenoGameProps) {
  const [lastWinningNumbers, setLastWinningNumbers] = useState<KenoBall[]>([])
  const gameLogic = useGameLogic({
    gameType: CASINO_GAME_TYPE.KENO,
    defaultSelection: {
      game: CASINO_GAME_TYPE.KENO,
      choice: DEFAULT_KENO_SELECTION,
    },
    backgroundImage,
  })

  const {
    isWalletConnected,
    token,
    gameHistory,
    refreshHistory,
    selection,
    setSelection,
    betStatus,
    gameResult,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    houseEdge,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
    kenoConfig,
  } = gameLogic

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(
    isWalletConnected,
    betStatus,
    isInGameResultState,
    isGamePaused,
  )

  const selectedNumbers = (selection as { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }).choice

  const { multipliers } = useKenoMultipliers({
    kenoConfig,
    selectedNumbersCount: selectedNumbers.length,
    houseEdge: houseEdge,
  })

  useEffect(() => {
    if (gameResult?.rolled?.game === CASINO_GAME_TYPE.KENO) {
      setLastWinningNumbers(gameResult.rolled.rolled)
    }
  }, [gameResult])

  const handleNumbersChange = (numbers: KenoBall[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({
      game: CASINO_GAME_TYPE.KENO,
      choice: numbers,
    })
  }

  return (
    <GameFrame themeSettings={themeSettings} variant="keno" {...props}>
      <GameFrame.Header title="Keno" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="keno">
        <GameFrame.InfoButton
          winChance={undefined}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          {kenoConfig ? (
            <KenoGameControls
              selectedNumbers={selectedNumbers}
              onNumbersChange={handleNumbersChange}
              maxSelections={kenoConfig.maxSelectableBalls}
              biggestSelectableBall={kenoConfig.biggestSelectableBall}
              multipliers={multipliers}
              isDisabled={isControlsDisabled}
              lastGameWinningNumbers={lastWinningNumbers}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-on-surface-variant border-t-transparent" />
            </div>
          )}
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        {...gameLogic}
        game={CASINO_GAME_TYPE.KENO}
        betCount={1}
        isConnected={isWalletConnected}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        hasValidSelection={selectedNumbers.length > 0}
      />
    </GameFrame>
  )
}
