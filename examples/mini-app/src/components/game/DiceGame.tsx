import diceBackground from "../../assets/game/game-background.png"

import { CASINO_GAME_TYPE, DiceNumber, FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import { useGameLogic } from "../../hooks/useGameLogic"
import { DiceGameControls } from "./DiceGameControls"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"

export interface DiceGameProps extends BaseGameProps {}

export function DiceGame({
  theme = "system",
  customTheme,
  backgroundImage = diceBackground,
  ...props
}: DiceGameProps) {
  const gameLogic = useGameLogic({
    gameType: CASINO_GAME_TYPE.DICE,
    defaultSelection: 50 as DiceNumber,
    backgroundImage,
  })

  const {
    isWalletConnected,
    balance,
    tokenDecimals,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    selection: selectedNumber,
    setSelection: setSelectedNumber,
    betStatus,
    gameResult,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    multiplier,
    isInGameResultState,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = gameLogic

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
          winChance={100 - selectedNumber}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, tokenDecimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={tokenDecimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <DiceGameControls
            selectedNumber={selectedNumber}
            onNumberChange={handleNumberChange}
            multiplier={Number(multiplier)}
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
        tokenDecimals={tokenDecimals}
        betStatus={betStatus}
        betAmount={betAmount}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        areChainsSynced={areChainsSynced}
      />
    </GameFrame>
  )
}
