import rouletteBackground from "../../assets/game/game-background.jpg?no-inline"

import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  Roulette,
  RouletteNumber,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { useGameLogic } from "../../hooks/useGameLogic"
import { GameFrame } from "./GameFrame"
import { RouletteGameControls } from "./RouletteGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_ROULETTE_SELECTION: RouletteNumber[] = []

export interface RouletteGameProps extends BaseGameProps {}

export function RouletteGame({
  theme = "system",
  customTheme,
  backgroundImage = rouletteBackground,
  ...props
}: RouletteGameProps) {
  const gameLogic = useGameLogic({
    gameType: CASINO_GAME_TYPE.ROULETTE,
    defaultSelection: {
      game: CASINO_GAME_TYPE.ROULETTE,
      choice: DEFAULT_ROULETTE_SELECTION,
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
    formattedNetMultiplier,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = gameLogic

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(
    isWalletConnected,
    betStatus,
    isInGameResultState,
    isGamePaused,
  )

  const selectedNumbers = (
    selection as { game: CASINO_GAME_TYPE.ROULETTE; choice: RouletteNumber[] }
  ).choice

  const handleNumbersChange = (numbers: RouletteNumber[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({ game: CASINO_GAME_TYPE.ROULETTE, choice: numbers })
  }

  return (
    <GameFrame themeSettings={themeSettings} variant="roulette" {...props}>
      <GameFrame.Header title="Roulette" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="roulette">
        <GameFrame.InfoButton
          winChance={Roulette.getWinChancePercent(selectedNumbers)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <RouletteGameControls
            selectedNumbers={selectedNumbers}
            onNumbersChange={handleNumbersChange}
            multiplier={formattedNetMultiplier}
            isDisabled={isControlsDisabled}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        {...gameLogic}
        game={CASINO_GAME_TYPE.ROULETTE}
        betCount={1}
        isConnected={isWalletConnected}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        hasValidSelection={selectedNumbers.length > 0}
      />
    </GameFrame>
  )
}
