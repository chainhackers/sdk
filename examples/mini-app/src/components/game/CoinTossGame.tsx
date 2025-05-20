import { History, Info } from "lucide-react"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import coinIcon from "../../assets/game/coin-background-icon.png"
import coinTossBackground from "../../assets/game/game-background.png"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet"
import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { TokenImage } from "@coinbase/onchainkit/token"
import { useAccount, useBalance } from "wagmi"
import { formatEther, formatUnits, parseEther } from "viem"

import { Sheet, SheetTrigger } from "../ui/sheet"
import { type HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { ETH_TOKEN } from "../../lib/tokens"
import { GameResultWindow } from "./GameResultWindow"

import { CASINO_GAME_TYPE, CoinToss, COINTOSS_FACE } from "@betswirl/sdk-core"
import { usePlaceBet } from "../../hooks/usePlaceBet"

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
  className,
  backgroundImage = coinTossBackground,
  ...props
}: CoinTossGameProps) {
  const [betAmount, setBetAmount] = useState("0")
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const { isConnected, address } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const balanceFloat = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals))
    : 0
  const formattedBalance = balanceFloat.toFixed(4)

  const multiplier = 1.94
  const winChance = 50
  const parsedBetAmountForPayout = Number.parseFloat(betAmount || "0")
  const targetPayout = (
    (Number.isNaN(parsedBetAmountForPayout) ? 0 : parsedBetAmountForPayout) *
    multiplier
  ).toFixed(2)
  const fee = 0

  const themeClass = theme === "system" ? undefined : theme

  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { placeBet, betStatus, gameResult } = usePlaceBet({
    betAmount: parseEther(betAmount),
    game: CASINO_GAME_TYPE.COINTOSS,
    gameEncodedInput: CoinToss.encodeInput(COINTOSS_FACE.HEADS),
  })

  const isBetAmountInvalid =
    Number.isNaN(Number.parseFloat(betAmount)) ||
    Number.parseFloat(betAmount || "0") <= 0

  return (
    <div
      className={cn(
        "cointoss-game-wrapper global-styles",
        themeClass,
        className,
      )}
      style={customTheme}
      {...props}
    >
      <Card
        ref={cardRef}
        className={cn(
          "relative overflow-hidden",
          "bg-card text-card-foreground border",
        )}
      >
        <CardHeader className="flex flex-row justify-between items-center h-[44px]">
          <CardTitle className="text-lg text-title-color font-bold">
            CoinToss
          </CardTitle>
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
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            className={cn(
              "h-[160px] rounded-[16px] flex flex-col justify-end items-center relative bg-cover bg-center bg-no-repeat",
              "bg-muted overflow-hidden",
            )}
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-[16px]",
                "bg-game-window-overlay",
              )}
            ></div>

            <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 left-2 z-10",
                    "text-white border border-border-stroke",
                    isInfoSheetOpen && "text-primary border-primary",
                  )}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              {isMounted && cardRef.current && (
                <InfoSheetPanel
                  portalContainer={cardRef.current}
                  winChance={winChance}
                  rngFee={fee}
                  targetPayout={targetPayout}
                  gasPrice="34.2123 gwei"
                />
              )}
            </Sheet>

            <Sheet
              open={isHistorySheetOpen}
              onOpenChange={setIsHistorySheetOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 right-2 z-5",
                    "text-white border border-border-stroke bg-neutral-background",
                    isHistorySheetOpen && "text-primary border-primary",
                  )}
                >
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              {isMounted && cardRef.current && (
                <HistorySheetPanel
                  portalContainer={cardRef.current}
                  historyData={mockHistoryData}
                />
              )}
            </Sheet>

            <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
              {multiplier.toFixed(2)} x
            </div>
            <img
              src={coinIcon}
              alt="Coin"
              className="absolute top-[62px] left-1/2 transform -translate-x-1/2 mt-2 h-16 w-16"
            />
            {gameResult && (
              <GameResultWindow
                isWin={gameResult.isWin}
                amount={Number(betAmount)}
                payout={Number(formatEther(gameResult.payout))}
                currency="ETH"
              />
            )}
          </div>

          <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium flex items-center">
                <span className="text-text-on-surface-variant">
                  Balance:&nbsp;
                </span>
                <span className="font-semibold">{formattedBalance}</span>
                <TokenImage token={ETH_TOKEN} size={16} className="ml-1" />
              </div>

              <Label
                htmlFor="betAmount"
                className="text-sm font-medium -mb-1 text-text-on-surface-variant"
              >
                Bet amount
              </Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="0"
                value={betAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setBetAmount(e.target.value)
                }}
                className="relative"
                token={{
                  icon: <TokenImage token={ETH_TOKEN} size={16} />,
                  symbol: "ETH",
                }}
                disabled={betStatus === "pending"}
              />

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBetAmount((prev) => {
                      const prevNum = Number.parseFloat(prev || "0")
                      return Number.isNaN(prevNum)
                        ? "0"
                        : (prevNum / 2).toString()
                    })
                  }}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={betStatus === "pending"}
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBetAmount((prev) => {
                      const old = Number.parseFloat(prev || "0")
                      const newAmount = Number.isNaN(old) ? 0 : old * 2
                      return Math.min(balanceFloat, newAmount)
                        .toFixed(4)
                        .toString()
                    })
                  }}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={betStatus === "pending"}
                >
                  2x
                </Button>
                <Button
                  variant="secondary"
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  onClick={() => {
                    setBetAmount(formattedBalance)
                  }}
                  disabled={betStatus === "pending"}
                >
                  Max
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className={cn(
                "w-full",
                "border-0",
                "text-play-btn-font font-bold",
                "rounded-[16px]",
              )}
              onClick={placeBet}
              disabled={
                !isConnected ||
                !address ||
                isBetAmountInvalid ||
                betStatus === "pending"
              }
            >
              {betStatus === "pending"
                ? "Placing Bet..."
                : isConnected
                  ? "Place Bet"
                  : "Connect Wallet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
