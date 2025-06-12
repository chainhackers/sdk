import rouletteBackground from "../../assets/game/game-background-5.png"

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
  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    selection: selectedNumbers,
    setSelection: setSelectedNumbers,
    betStatus,
    gameResult,
    vrfFees,
    formattedVrfFees,
    gasPrice,
    targetPayoutAmount,
    formattedNetMultiplier,
    grossMultiplier,
    isInGameResultState,
    isGamePaused,
    nativeCurrencySymbol,
    themeSettings: baseThemeSettings,
    handlePlayButtonClick,
    handleBetAmountChange,
  } = useGameLogic({
    gameType: CASINO_GAME_TYPE.ROULETTE,
    defaultSelection: DEFAULT_ROULETTE_SELECTION,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(isWalletConnected, betStatus, isInGameResultState)

  const handleNumbersChange = (numbers: RouletteNumber[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelectedNumbers(numbers as typeof selectedNumbers)
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
        <GameFrame.ResultWindow gameResult={gameResult} betAmount={betAmount} currency="ETH" />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.ROULETTE}
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
        isGamePaused={isGamePaused}
      />
    </GameFrame>
  )
}
