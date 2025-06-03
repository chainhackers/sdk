import React, { useState } from "react"
import diceBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"

import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { useAccount, useBalance } from "wagmi"

import {
  CASINO_GAME_TYPE,
  DiceNumber,
  BP_VALUE,
  chainById,
  chainNativeCurrencyToToken,
} from "@betswirl/sdk-core"
import { useGameHistory } from "../../hooks/useGameHistory"
import { usePlaceBet } from "../../hooks/usePlaceBet"
import { GameFrame } from "./GameFrame"
import { DiceGameControls } from "./DiceGameControls"
import { useChain } from "../../context/chainContext"
import { useHouseEdge } from "../../hooks/useHouseEdge"
import { formatGwei } from "viem"

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
  const themeSettings = { theme, customTheme, backgroundImage }
  const { isConnected: isWalletConnected, address } = useAccount()
  const { gameHistory, refreshHistory } = useGameHistory(CASINO_GAME_TYPE.DICE)
  const { data: balance } = useBalance({
    address,
  })
  const { areChainsSynced, appChainId } = useChain()

  const { houseEdge } = useHouseEdge({
    game: CASINO_GAME_TYPE.DICE,
    token: chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
  })

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)
  const [selectedNumber, setSelectedNumber] = useState<DiceNumber>(50)

  const {
    placeBet,
    betStatus,
    gameResult,
    resetBetState,
    formattedVrfFees,
    gasPrice,
  } = usePlaceBet(CASINO_GAME_TYPE.DICE)
  const isInGameResultState = !!gameResult

  const handlePlayButtonClick = () => {
    if (betStatus === "error" || isInGameResultState) {
      resetBetState()
    } else if (isWalletConnected && betAmount && betAmount > 0n) {
      placeBet(betAmount, selectedNumber)
    }
  }

  const handleNumberChange = (value: number) => {
    setSelectedNumber(value as DiceNumber)
  }

  const handleBetAmountChange = (amount: bigint | undefined) => {
    setBetAmount(amount)
  }

  const tokenDecimals = balance?.decimals ?? 18

  const grossMultiplier = Math.floor((100 / (100 - selectedNumber)) * 10000)

  function getFees(payout: bigint) {
    return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE)
  }

  function getGrossPayout(amount: bigint, numBets: number) {
    return (
      (amount * BigInt(numBets) * BigInt(grossMultiplier)) / BigInt(BP_VALUE)
    )
  }

  function getNetPayout(amount: bigint, numBets: number) {
    const grossPayout = getGrossPayout(amount, numBets)
    return grossPayout - getFees(grossPayout)
  }

  const targetPayoutAmount =
    betAmount && betAmount > 0n ? getNetPayout(betAmount, 1) : 0n

  const multiplier = Number(
    Number(getNetPayout(1000000000000000000n, 1)) / 1e18,
  ).toFixed(2)
  const isControlsDisabled =
    !isWalletConnected || betStatus === "pending" || isInGameResultState

  return (
    <GameFrame
      {...props}
      onPlayBtnClick={handlePlayButtonClick}
      historyData={gameHistory}
      themeSettings={themeSettings}
      isConnected={isWalletConnected}
      balance={balance?.value ?? 0n}
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      tokenDecimals={tokenDecimals}
      targetPayoutAmount={targetPayoutAmount}
      gameResult={gameResult}
      betStatus={betStatus}
      onHistoryOpen={refreshHistory}
      vrfFees={formattedVrfFees}
      gasPrice={formatGwei(gasPrice)}
      areChainsSynced={areChainsSynced}
      gameControls={
        <DiceGameControls
          selectedNumber={selectedNumber}
          onNumberChange={handleNumberChange}
          multiplier={Number(multiplier)}
          isDisabled={isControlsDisabled}
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
