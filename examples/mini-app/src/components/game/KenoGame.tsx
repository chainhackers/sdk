import kenoBackground from "../../assets/game/game-background.jpg?no-inline"

import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  Keno,
  KenoBall,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { useGameLogic } from "../../hooks/useGameLogic"
import { GameFrame } from "./GameFrame"
import { KenoGameControls } from "./KenoGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"
import { useChain } from "../../context/chainContext"

const DEFAULT_KENO_SELECTION: KenoBall[] = []
const DEFAULT_MAX_SELECTIONS = 10
const DEFAULT_MULTIPLIERS = [0, 3.6, 12.0, 42.0, 100.0, 200.0, 450.0, 1000.0, 1800.0, 3600.0, 10000.0]

export interface KenoGameProps extends BaseGameProps {}

export function KenoGame({
  theme = "system",
  customTheme,
  backgroundImage = kenoBackground,
  ...props
}: KenoGameProps) {
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
    gameType: CASINO_GAME_TYPE.KENO,
    defaultSelection: {
      game: CASINO_GAME_TYPE.KENO,
      choice: DEFAULT_KENO_SELECTION,
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

  const selectedNumbers = (
    selection as { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }
  ).choice

  const { appChainId } = useChain()

  const kenoConfig = {
    token: token,
    chainId: appChainId,
    biggestSelectableBall: 15,
    maxSelectableBalls: 7,
    mutliplierTable: [],
  }

  const handleNumbersChange = (numbers: KenoBall[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({
      game: CASINO_GAME_TYPE.KENO,
      choice: numbers,
    })
  }

  const lastGameWinningNumbers =
    gameResult?.rolled?.game === CASINO_GAME_TYPE.KENO
      ? gameResult.rolled.rolled
      : []

  return (
    <GameFrame themeSettings={themeSettings} variant="keno" {...props}>
      <GameFrame.Header title="Keno" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="keno">
        <GameFrame.InfoButton
          winChance={Keno.getWinChancePercent(kenoConfig, selectedNumbers.length, Math.ceil(selectedNumbers.length / 2))}
          rngFee={formattedVrfFees}
          targetPayout={formatRawAmount(targetPayoutAmount, token.decimals, FORMAT_TYPE.PRECISE)}
          gasPrice={gasPrice}
          tokenDecimals={token.decimals}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
        <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
        <GameFrame.GameControls>
          <KenoGameControls
            selectedNumbers={selectedNumbers}
            onNumbersChange={handleNumbersChange}
            maxSelections={DEFAULT_MAX_SELECTIONS}
            multipliers={DEFAULT_MULTIPLIERS}
            isDisabled={isControlsDisabled}
            lastGameWinningNumbers={lastGameWinningNumbers}
          />
        </GameFrame.GameControls>
        <GameFrame.ResultWindow
          gameResult={gameResult}
          betAmount={betAmount}
          currency={token.symbol}
        />
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.KENO}
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
        hasValidSelection={selectedNumbers.length > 0}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
