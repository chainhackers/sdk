import diceBackground from "../../assets/game/game-background.png"

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

const DEFAULT_DICE_NUMBER = 20 as DiceNumber

export interface DiceGameProps extends BaseGameProps {}

export function DiceGame({
  theme = "system",
  customTheme,
  backgroundImage = diceBackground,
  ...props
}: DiceGameProps) {
  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    selection: selectedNumber,
    setSelection: setSelectedNumber,
    betStatus,
    gameResult,
    vrfFees,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    multiplier,
    isInGameResultState,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = useGameLogic({
    gameType: CASINO_GAME_TYPE.DICE,
    defaultSelection: DEFAULT_DICE_NUMBER,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const handleNumberChange = (value: number) => {
    if (isControlsDisabled) {
      return
    }
    setSelectedNumber(value as DiceNumber)
  }

  const isControlsDisabled =
    !isWalletConnected ||
    betStatus === "pending" ||
    betStatus === "loading" ||
    betStatus === "rolling" ||
    isInGameResultState

  return (
    <GameFrame themeSettings={themeSettings} {...props}>
      <GameFrame.Header title="Dice" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={Dice.getWinChancePercent(selectedNumber)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <DiceGameControls
            selectedNumber={selectedNumber}
            onNumberChange={handleNumberChange}
            multiplier={multiplier}
            isDisabled={isControlsDisabled}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={gameResult}
          betAmount={betAmount}
          currency={nativeCurrencySymbol}
        />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        balance={balance}
        isConnected={isWalletConnected}
        token={token}
        betStatus={betStatus}
        betAmount={betAmount}
        vrfFees={vrfFees}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        areChainsSynced={areChainsSynced}
      />
    </GameFrame>
  )
}
