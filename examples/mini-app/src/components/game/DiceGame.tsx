import diceBackground from "../../assets/game/game-background.png"

import { CASINO_GAME_TYPE, DiceNumber } from "@betswirl/sdk-core"
import { GameFrame } from "./GameFrame"
import { DiceGameControls } from "./DiceGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameLogic } from "../../hooks/useGameLogic"

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
      <GameFrame.Header
        title="Dice"
        connectWalletButton={<GameConnectWallet />}
      />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={50}
          rngFee={formattedVrfFees}
          targetPayout={targetPayoutAmount.toString()}
          gasPrice={gasPrice}
          tokenDecimals={tokenDecimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton
          historyData={gameHistory}
          onHistoryOpen={refreshHistory}
        />
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
          currency="ETH"
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
