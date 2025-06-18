import coinTossBackground from "../../assets/game/game-background.jpg"

import {
  CASINO_GAME_TYPE,
  COINTOSS_FACE,
  CoinToss,
  FORMAT_TYPE,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { useGameLogic } from "../../hooks/useGameLogic"
import { CoinTossGameControls } from "./CoinTossGameControls"
import { GameFrame } from "./GameFrame"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

export interface CoinTossGameProps extends BaseGameProps {}

export function CoinTossGame({
  theme = "system",
  customTheme,
  backgroundImage = coinTossBackground,
  ...props
}: CoinTossGameProps) {
  const {
    isWalletConnected,
    balance,
    token,
    areChainsSynced,
    gameHistory,
    refreshHistory,
    betAmount,
    selection,
    setSelection,
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
    needsTokenApproval,
    isApprovePending,
    isApproveConfirming,
    isRefetchingAllowance,
    approveError,
  } = useGameLogic({
    gameType: CASINO_GAME_TYPE.COINTOSS,
    defaultSelection: {
      game: CASINO_GAME_TYPE.COINTOSS,
      choice: COINTOSS_FACE.HEADS,
    },
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(
    isWalletConnected,
    betStatus,
    isInGameResultState,
    isGamePaused,
  )

  const selectedSide = (selection as { game: CASINO_GAME_TYPE.COINTOSS; choice: COINTOSS_FACE })
    .choice

  const handleCoinClick = () => {
    if (isControlsDisabled) {
      return
    }
    const newSide = selectedSide === COINTOSS_FACE.HEADS ? COINTOSS_FACE.TAILS : COINTOSS_FACE.HEADS
    setSelection({ game: CASINO_GAME_TYPE.COINTOSS, choice: newSide })
  }

  return (
    <GameFrame themeSettings={themeSettings} {...props}>
      <GameFrame.Header title="CoinToss" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea>
        <GameFrame.InfoButton
          winChance={CoinToss.getWinChancePercent(selectedSide)}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <CoinTossGameControls
            selectedSide={selectedSide}
            onCoinClick={handleCoinClick}
            multiplier={formattedNetMultiplier}
            isDisabled={isControlsDisabled}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow gameResult={gameResult} betAmount={betAmount} currency="ETH" />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.COINTOSS}
        betCount={1} // TODO: Dynamic bet count support (#64)
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
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
