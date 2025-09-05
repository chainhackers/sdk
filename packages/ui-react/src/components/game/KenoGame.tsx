import {
  CASINO_GAME_TYPE,
  chainById,
  chainNativeCurrencyToToken,
  FORMAT_TYPE,
  formatRawAmount,
  Keno,
  KenoBall,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import kenoBackground from "../../assets/game/game-background.jpg"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useGameLogic } from "../../hooks/useGameLogic"
import { useHouseEdge } from "../../hooks/useHouseEdge"
import { useKenoConfiguration } from "../../hooks/useKenoConfiguration"
import { useKenoMultipliers } from "../../hooks/useKenoMultipliers"
import { GameDefinition } from "../../types/types"
import { Loader } from "../ui/Loader"
import { GameFrame } from "./GameFrame"
import { KenoGameControls } from "./KenoGameControls"
import { GameConnectWallet } from "./shared/GameConnectWallet"
import { BaseGameProps } from "./shared/types"
import { useGameControls } from "./shared/useGameControls"

const DEFAULT_KENO_SELECTION: KenoBall[] = []

export interface KenoGameProps extends BaseGameProps {}
export function KenoGame({
  theme = "system",
  customTheme,
  backgroundImage = kenoBackground,
  onPlayNow,
  ...props
}: KenoGameProps) {
  const [lastWinningNumbers, setLastWinningNumbers] = useState<KenoBall[]>([])

  const { selectedToken } = useTokenContext()
  const { appChainId } = useChain()
  const token = useMemo(() => {
    return (
      selectedToken || {
        ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
        image: "",
      }
    )
  }, [selectedToken, appChainId])

  const { config: kenoConfig, loading: kenoConfigLoading } = useKenoConfiguration({ token })

  const kenoGameDefinition = useMemo((): GameDefinition<{
    game: CASINO_GAME_TYPE.KENO
    choice: KenoBall[]
  }> => {
    if (!kenoConfig) {
      return {
        gameType: CASINO_GAME_TYPE.KENO,
        defaultSelection: {
          game: CASINO_GAME_TYPE.KENO,
          choice: DEFAULT_KENO_SELECTION,
        },
        getMultiplier: () => 0,
        encodeInput: () => 0,
        formatDisplayResult: () => "",
        encodeAbiParametersInput: () => "0x",
      }
    }

    return {
      gameType: CASINO_GAME_TYPE.KENO,
      defaultSelection: {
        game: CASINO_GAME_TYPE.KENO,
        choice: DEFAULT_KENO_SELECTION,
      },
      getMultiplier: (choice) => {
        const multipliers = kenoConfig.multiplierTable[choice.length] || []
        const maxMultiplierHits = multipliers.length > 0 ? multipliers.length - 1 : 0
        return Keno.getMultiplier(kenoConfig, choice.length, maxMultiplierHits)
      },
      encodeInput: (choice) => Keno.encodeInput(choice, kenoConfig),
      encodeAbiParametersInput: (choice) => Keno.encodeAbiParametersInput(choice, kenoConfig),
      formatDisplayResult: (rolledResult) => {
        if (Array.isArray(rolledResult.rolled)) {
          return rolledResult.rolled.join(", ")
        }
        return rolledResult.rolled.toString()
      },
    }
  }, [kenoConfig])

  const {
    isWalletConnected,
    balance,
    token: gameToken,
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
    gameDefinition: kenoGameDefinition,
    backgroundImage,
  })

  const themeSettings = { ...baseThemeSettings, theme, customTheme }
  const isControlsDisabled = useGameControls(
    isWalletConnected,
    betStatus,
    isInGameResultState,
    isGamePaused,
  )

  const { status: walletStatus } = useAccount()

  const selectedNumbers = (selection as { game: CASINO_GAME_TYPE.KENO; choice: KenoBall[] }).choice

  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.KENO,
    token: gameToken,
  })
  const { multipliers } = useKenoMultipliers({
    kenoConfig,
    selectedNumbersCount: selectedNumbers.length,
    houseEdge,
  })

  useEffect(() => {
    if (gameResult?.rolled?.game === CASINO_GAME_TYPE.KENO) {
      setLastWinningNumbers(gameResult.rolled.rolled)
    }
  }, [gameResult])

  const handleNumbersChange = (numbers: KenoBall[]) => {
    if (isControlsDisabled) {
      return
    }
    setSelection({
      game: CASINO_GAME_TYPE.KENO,
      choice: numbers,
    })
  }

  // Show loading state while configuration is being fetched
  const isConfigurationLoading = kenoConfigLoading || !kenoConfig

  return (
    <GameFrame themeSettings={themeSettings} variant="keno" onPlayNow={onPlayNow} {...props}>
      <GameFrame.Header title="Keno" connectWalletButton={<GameConnectWallet />} />
      <GameFrame.GameArea variant="keno">
        {isConfigurationLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : (
          <>
            <GameFrame.InfoButton
              winChance={undefined}
              rngFee={formattedVrfFees}
              targetPayout={formatRawAmount(
                targetPayoutAmount,
                gameToken.decimals,
                FORMAT_TYPE.PRECISE,
              )}
              gasPrice={gasPrice}
              tokenDecimals={gameToken.decimals}
              nativeCurrencySymbol={nativeCurrencySymbol}
            />
            <GameFrame.HistoryButton historyData={gameHistory} onHistoryOpen={refreshHistory} />
            <GameFrame.GameControls>
              <KenoGameControls
                selectedNumbers={selectedNumbers}
                onNumbersChange={handleNumbersChange}
                kenoConfig={kenoConfig}
                multipliers={multipliers}
                isDisabled={isControlsDisabled}
                lastGameWinningNumbers={lastWinningNumbers}
              />
            </GameFrame.GameControls>
            <GameFrame.ResultWindow gameResult={gameResult} currency={gameToken.symbol} />
          </>
        )}
      </GameFrame.GameArea>
      <GameFrame.BettingSection
        game={CASINO_GAME_TYPE.KENO}
        betCount={1}
        grossMultiplier={grossMultiplier}
        balance={balance}
        isConnected={isWalletConnected}
        isWalletConnecting={walletStatus === "connecting"}
        token={gameToken}
        betStatus={betStatus}
        betAmount={betAmount}
        vrfFees={vrfFees}
        onBetAmountChange={handleBetAmountChange}
        onPlayBtnClick={handlePlayButtonClick}
        areChainsSynced={areChainsSynced}
        isGamePaused={isGamePaused}
        hasValidSelection={selectedNumbers.length >= 2}
        invalidSelectionMessage={"Not enough numbers selected"}
        needsTokenApproval={needsTokenApproval}
        isApprovePending={isApprovePending}
        isApproveConfirming={isApproveConfirming}
        isRefetchingAllowance={isRefetchingAllowance}
        approveError={approveError}
      />
    </GameFrame>
  )
}
