import React from "react"
import coinTossBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"

import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"

import { CASINO_GAME_TYPE, COINTOSS_FACE } from "@betswirl/sdk-core"
import { GameFrame } from "./GameFrame"
import { CoinTossGameControls } from "./CoinTossGameControls"
import { useGameLogic } from "../../hooks/useGameLogic"

export interface CoinTossGameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage?: string
}

export function CoinTossGame({
  theme = "system",
  customTheme,
  backgroundImage = coinTossBackground,
  ...props
}: CoinTossGameProps) {
  const gameLogic = useGameLogic({
    gameType: CASINO_GAME_TYPE.COINTOSS,
    defaultSelection: COINTOSS_FACE.HEADS,
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
    selection: selectedSide,
    setSelection: setSelectedSide,
    betStatus,
    gameResult,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    multiplier,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = gameLogic

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const handleCoinClick = () => {
    if (!isWalletConnected || betStatus === "pending" || !!gameResult) {
      return
    }
    setSelectedSide(
      (selectedSide === COINTOSS_FACE.HEADS
        ? COINTOSS_FACE.TAILS
        : COINTOSS_FACE.HEADS) as typeof selectedSide,
    )
  }

  const isCoinClickable =
    isWalletConnected && betStatus !== "pending" && !gameResult

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
        <CoinTossGameControls
          selectedSide={selectedSide}
          onCoinClick={handleCoinClick}
          multiplier={multiplier}
          isDisabled={!isCoinClickable}
        />
      }
      connectWallletBtn={
        <Wallet>
          <ConnectWallet
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "bg-neutral-background",
              "rounded-[12px]",
              "border border-border-stroke",
              "px-3 py-1.5 h-[44px]",
              "text-primary",
            )}
            disconnectedLabel="Connect"
          >
            <div className="flex items-center">
              <Avatar
                className="h-7 w-7 mr-2"
                address="0x838aD0EAE54F99F1926dA7C3b6bFbF617389B4D9"
              />
              <Name className="text-title-color" />
            </div>
          </ConnectWallet>
        </Wallet>
      }
    />
  )
}
