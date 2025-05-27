import React, { useState } from "react"
import diceBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"

import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { TokenImage } from "@coinbase/onchainkit/token"
import { useAccount, useBalance } from "wagmi"

import { type HistoryEntry } from "./HistorySheetPanel"
import { ETH_TOKEN } from "../../lib/tokens"

import { GameFrame } from "./GameFrame"
import { DiceNumber } from "@betswirl/sdk-core"
import { useDicePlaceBet } from "../../hooks/useDicePlaceBet"

const MULTIPLIER = 1940n
const PRECISION = 10000n

export interface DiceGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage?: string
}

const mockHistoryData: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Won bet",
    multiplier: 1.2,
    payoutAmount: 0.2,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "3",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "4",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "5",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "6",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "7",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "8",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
  {
    id: "9",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <TokenImage token={ETH_TOKEN} size={14} />,
    timestamp: "~2h ago",
  },
]

export function CoinTossGame({
  theme = "system",
  customTheme,
  backgroundImage = diceBackground,
  ...props
}: DiceGameProps) {
  const themeSettings = { theme, customTheme, backgroundImage }
  const { isConnected: isWalletConnected, address } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const tokenDecimals = balance?.decimals ?? 18

  const [betAmount, setBetAmount] = useState<bigint | undefined>(undefined)

  const { placeDiceBet, betStatus, gameResult, resetBetState } =
    useDicePlaceBet()
  const isInGameResultState = !!gameResult

  const targetPayoutAmount =
    betAmount && betAmount > 0n ? (betAmount * MULTIPLIER) / PRECISION : 0n

  const handlePlayButtonClick = (selected: DiceNumber) => {
    if (betStatus === "error" || isInGameResultState) {
      resetBetState()
    }

    if (isWalletConnected && betAmount && betAmount > 0n) {
      placeDiceBet(betAmount, selected)
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
      historyData={mockHistoryData}
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
