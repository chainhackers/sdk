import React, { useState } from "react"
import coinTossBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"

import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { useAccount, useBalance } from "wagmi"

import { CASINO_GAME_TYPE, COINTOSS_FACE } from "@betswirl/sdk-core"
import { usePlaceBet } from "../../hooks/usePlaceBet"
import { GameFrame } from "./GameFrame"
import { useGameHistory } from "../../hooks/useGameHistory"

const MULTIPLIER = 1940n
const PRECISION = 10000n

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
  const themeSettings = { theme, customTheme, backgroundImage }
  const { isConnected: isWalletConnected, address } = useAccount()
  const { gameHistory, refreshHistory } = useGameHistory(
    CASINO_GAME_TYPE.COINTOSS,
    address,
  )
  const { data: balance } = useBalance({
    address,
  })
  const tokenDecimals = balance?.decimals ?? 18

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)

  const { placeBet, betStatus, gameResult, resetBetState } = usePlaceBet()
  const isInGameResultState = !!gameResult

  const targetPayoutAmount =
    betAmount && betAmount > 0n ? (betAmount * MULTIPLIER) / PRECISION : 0n

  const handlePlayButtonClick = (selectedSide: COINTOSS_FACE) => {
    if (betStatus === "error" || isInGameResultState) {
      resetBetState()
    } else if (isWalletConnected && betAmount && betAmount > 0n) {
      placeBet(betAmount, selectedSide)
    }
  }

  const handleHalfBet = () => {
    const currentAmount = betAmount ?? 0n
    if (currentAmount > 0n) {
      setBetAmount(currentAmount / 2n)
    }
  }

  const handleDoubleBet = () => {
    const currentAmount = betAmount ?? 0n
    const doubledAmount = currentAmount * 2n
    // Only limit to balance if connected
    if (isWalletConnected) {
      const maxAmount = balance?.value ?? 0n
      setBetAmount(doubledAmount > maxAmount ? maxAmount : doubledAmount)
    } else {
      setBetAmount(doubledAmount)
    }
  }

  const handleMaxBet = () => {
    if (isWalletConnected) {
      setBetAmount(balance?.value ?? 0n)
    }
  }

  return (
    <GameFrame
      {...props}
      onPlayBtnClick={handlePlayButtonClick}
      historyData={gameHistory}
      tokenDecimals={tokenDecimals}
      themeSettings={themeSettings}
      isConnected={isWalletConnected}
      balance={balance?.value ?? 0n}
      betAmount={betAmount}
      setBetAmount={setBetAmount}
      targetPayoutAmount={targetPayoutAmount}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onMaxBet={handleMaxBet}
      gameResult={gameResult}
      betStatus={betStatus}
      onHistoryOpen={refreshHistory}
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
