import React, { useEffect } from "react"
import coinTossBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"

import { TokenImage } from "@coinbase/onchainkit/token"
import { useAccount, useBalance } from "wagmi"
import { formatUnits, Hex, parseEther } from "viem"

import { type HistoryEntry } from "./HistorySheetPanel"
import { ETH_TOKEN } from "../../lib/tokens"

import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { Avatar, Name } from "@coinbase/onchainkit/identity"

import {
  CASINO_GAME_TYPE,
  CoinToss,
  COINTOSS_FACE,
  GenericCasinoBetParams,
} from "@betswirl/sdk-core"
import { usePlaceBet } from "../../hooks/usePlaceBet"
import { CHAIN } from "../../providers.tsx"
import { GameFrame } from "./GameFrame.tsx"

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
  backgroundImage = coinTossBackground,
  ...props
}: CoinTossGameProps) {
  const themeSettings = { theme, customTheme, backgroundImage }
  const { isConnected, address } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const balanceFloat = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals))
    : 0

  const { placeBet, isPlacingBet, betError, transactionHash } = usePlaceBet()

  useEffect(() => {
    if (transactionHash && !betError) {
      const explorerUrl = CHAIN.blockExplorers?.default.url
      const txMessage = explorerUrl
        ? `Transaction Hash: ${transactionHash}, Link: ${explorerUrl}/tx/${transactionHash}`
        : `Transaction Hash: ${transactionHash}`
      console.log(`Bet placed! ${txMessage}`)
    }
  }, [transactionHash, betError])

  const placeGameBet = async (betAmount: string) => {
    if (!address || !isConnected || isPlacingBet) {
      console.error(
        "Attempted to place bet without address or connection or while placing bet.",
      )
      return
    }

    const betParams: GenericCasinoBetParams = {
      betAmount: parseEther(betAmount),
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedInput: CoinToss.encodeInput(COINTOSS_FACE.HEADS),
    }
    placeBet(betParams, address as Hex)
  }

  return (
    <GameFrame
      {...props}
      onPlaceBet={placeGameBet}
      address={address as Hex}
      isConnected={isConnected}
      isPlacingBet={isPlacingBet}
      themeSettings={themeSettings}
      historyData={mockHistoryData}
      balance={balanceFloat}
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
