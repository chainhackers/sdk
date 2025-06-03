import coinTossBackground from "../../assets/game/game-background.png"

import { CASINO_GAME_TYPE, COINTOSS_FACE } from "@betswirl/sdk-core"
import { GameFrame } from "./GameFrame"
import { CoinTossGameControls } from "./CoinTossGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/BaseGameProps"
import { useGameLogic } from "../../hooks/useGameLogic"

export interface CoinTossGameProps extends BaseGameProps {}

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
    isInGameResultState,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = gameLogic

  const themeSettings = { ...baseThemeSettings, theme, customTheme }

  const isControlsDisabled =
    !isWalletConnected ||
    betStatus === "pending" ||
    betStatus === "loading" ||
    betStatus === "rolling" ||
    isInGameResultState

  const handleCoinClick = () => {
    if (isControlsDisabled) {
      return
    }
    setSelectedSide(
      (selectedSide === COINTOSS_FACE.HEADS
        ? COINTOSS_FACE.TAILS
        : COINTOSS_FACE.HEADS) as typeof selectedSide,
    )
  }

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
          isDisabled={isControlsDisabled}
        />
      }
      connectWallletBtn={<GameConnectWallet />}
    />
  )
}
