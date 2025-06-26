import diceBackground from "../../assets/game/game-background.jpg?no-inline"

import {
  CASINO_GAME_TYPE,
  Dice,
  DiceNumber,
  FORMAT_TYPE,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { useGameLogic } from "../../hooks/useGameLogic"
import { DiceGameControls } from "./DiceGameControls"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_DICE_NUMBER = 20 as DiceNumber

export interface DiceGameProps extends BaseGameProps {}

export function DiceGame({
  theme = "system",
  customTheme,
  backgroundImage = diceBackground,
  ...props
}: DiceGameProps) {
  const gameLogic = useGameLogic({
    gameType: CASINO_GAME_TYPE.DICE,
    defaultSelection: {
      game: CASINO_GAME_TYPE.DICE,
      choice: DEFAULT_DICE_NUMBER,
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

  const selectedDiceNumber = (selection as { game: CASINO_GAME_TYPE.DICE; choice: DiceNumber })
    .choice

  const handleNumberChange = (value: number) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({ game: CASINO_GAME_TYPE.DICE, choice: value as DiceNumber })
  }

  return (
    <GameFrame themeSettings={themeSettings} {...props}>
      <GameFrame.Header title="Dice" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={Dice.getWinChancePercent(selectedDiceNumber)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <DiceGameControls
            selectedNumber={selectedDiceNumber}
            onNumberChange={handleNumberChange}
            multiplier={formattedNetMultiplier}
            isDisabled={isControlsDisabled}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} currency={token.symbol} />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        {...gameLogic}
        game={CASINO_GAME_TYPE.DICE}
        betCount={1}
        isConnected={isWalletConnected}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
      />
    </GameFrame>
  )
}
