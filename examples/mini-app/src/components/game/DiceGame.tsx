import React from "react"
import diceBackground from "../../assets/game/game-background.png"

import { CASINO_GAME_TYPE, DiceNumber } from "@betswirl/sdk-core"
import { GameFrame } from "./GameFrame"
import { DiceGameControls } from "./DiceGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { useGameLogic } from "../../hooks/useGameLogic"

export interface DiceGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage?: string
}

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
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = gameLogic

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const handleNumberChange = (value: number) => {
    setSelectedNumber(value as DiceNumber)
  }

  const isControlsDisabled =
    !isWalletConnected || betStatus === "pending" || isInGameResultState

  return (
    <GameFrame
      {...props}
      onPlayBtnClick={handlePlayButtonClick}
      historyData={gameHistory}
      themeSettings={themeSettings}
      isConnected={isWalletConnected}
      balance={balance}
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      tokenDecimals={tokenDecimals}
      targetPayoutAmount={targetPayoutAmount}
      gameResult={gameResult}
      betStatus={betStatus}
      onHistoryOpen={refreshHistory}
      vrfFees={formattedVrfFees}
      gasPrice={gasPrice}
      areChainsSynced={areChainsSynced}
      gameControls={
        <DiceGameControls
          selectedNumber={selectedNumber}
          onNumberChange={handleNumberChange}
          multiplier={Number(multiplier)}
          isDisabled={isControlsDisabled}
        />
      }
      connectWallletBtn={<GameConnectWallet />}
    />
  )
}
