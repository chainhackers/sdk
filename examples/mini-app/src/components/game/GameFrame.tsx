import { History, Info } from "lucide-react"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import coinIcon from "../../assets/game/coin-background-icon.png"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import { TokenImage } from "@coinbase/onchainkit/token"

import { Sheet, SheetTrigger } from "../ui/sheet"
import { HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { ETH_TOKEN } from "../../lib/tokens"
import { GameResultWindow } from "./GameResultWindow"
import { BetStatus, GameResultFormatted } from "../../types"

function formatBetAmount(num: number, decimals: number): string {
  if (Number.isNaN(num)) return "0"
  if (num === 0) return "0"

  let s = num.toFixed(decimals)

  if (s.includes(".")) {
    s = s.replace(/\.?0+$/, "")
  }

  if (s.endsWith(".")) {
    s = s.slice(0, -1)
  }

  return s === "" || Number.isNaN(parseFloat(s)) ? "0" : s
}

interface IThemeSettings {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage: string
}

interface GameFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  themeSettings: IThemeSettings
  historyData: HistoryEntry[]
  balance: number
  connectWallletBtn: React.ReactNode
  isConnected: boolean
  onPlayBtnClick: (betAmount: string) => void
  tokenDecimals: number
  gameResult: GameResultFormatted | null
  betStatus: BetStatus | null
}

const STEP = 0.0001

export function GameFrame({
  themeSettings,
  historyData,
  balance,
  connectWallletBtn,
  isConnected,
  onPlayBtnClick,
  tokenDecimals,
  gameResult,
  betStatus,
  ...props
}: GameFrameProps) {
  const [betAmount, setBetAmount] = useState("0")
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = themeSettings

  const themeClass = theme === "system" ? undefined : theme

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isBetAmountInvalid =
    Number.isNaN(Number.parseFloat(betAmount)) ||
    Number.parseFloat(betAmount || "0") <= 0

  const multiplier = 1.94
  const winChance = 50
  const parsedBetAmountForPayout = Number.parseFloat(betAmount || "0")
  const targetPayout = (
    (Number.isNaN(parsedBetAmountForPayout) ? 0 : parsedBetAmountForPayout) *
    multiplier
  ).toFixed(2)
  const fee = 0

  const formattedBalance = balance.toFixed(4)

  const isInGameResultState = !!gameResult
  const isBettingInProgress = betStatus === "pending"
  const canInitiateBet =
    isConnected && !isBetAmountInvalid && !isBettingInProgress

  const isErrorState = betStatus === "error"

  const isPlayButtonDisabled: boolean = isErrorState
    ? false
    : isInGameResultState
      ? false
      : !canInitiateBet

  let playButtonText: string
  if (isErrorState) {
    playButtonText = "Error, try again"
  } else if (isInGameResultState) {
    playButtonText = "Try again"
  } else if (isBettingInProgress) {
    playButtonText = "Placing Bet..."
  } else if (!isConnected) {
    playButtonText = "Connect Wallet"
  } else {
    playButtonText = "Place Bet"
  }

  const handlePlayBtnClick = () => {
    if (isInGameResultState) {
      setBetAmount("0")
    }
    onPlayBtnClick(betAmount)
  }

  return (
    <div
      className={cn(
        "cointoss-game-wrapper game-global-styles",
        themeClass,
        props.className,
      )}
      style={themeSettings.customTheme as React.CSSProperties}
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
          {connectWallletBtn}
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            className={cn(
              "h-[160px] rounded-[16px] flex flex-col justify-end items-center relative bg-cover bg-center bg-no-repeat",
              "bg-muted overflow-hidden",
            )}
            style={{
              backgroundImage: `url(${themeSettings.backgroundImage})`,
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
                  historyData={historyData}
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
            <GameResultWindow
              isVisible={!!gameResult}
              isWin={gameResult?.isWin}
              amount={Number(betAmount)}
              payout={gameResult?.payout}
              currency="ETH"
              rolled={gameResult?.rolled || ""}
            />
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
                min={0}
                max={balance}
                step={STEP}
                value={betAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setBetAmount(e.target.value)
                }}
                className="relative"
                token={{
                  icon: <TokenImage token={ETH_TOKEN} size={16} />,
                  symbol: "ETH",
                }}
                disabled={
                  !isConnected || betStatus === "pending" || !!gameResult
                }
              />

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBetAmount((prev) => {
                      const prevNum = Number.parseFloat(prev || "0")
                      if (Number.isNaN(prevNum) || prevNum === 0) return "0"
                      return formatBetAmount(prevNum / 2, tokenDecimals)
                    })
                  }}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={
                    !isConnected || isBettingInProgress || isInGameResultState
                  }
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setBetAmount((prev) => {
                      const oldNum = Number.parseFloat(prev || "0")
                      const newAmount = oldNum * 2
                      const finalAmount = Math.min(balance, newAmount)
                      return formatBetAmount(finalAmount, tokenDecimals)
                    })
                  }}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={
                    !isConnected || isBettingInProgress || isInGameResultState
                  }
                >
                  2x
                </Button>
                <Button
                  variant="secondary"
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  onClick={() => {
                    setBetAmount(formattedBalance)
                  }}
                  disabled={
                    !isConnected || isBettingInProgress || isInGameResultState
                  }
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
                "font-bold",
                "rounded-[16px]",
                "text-play-btn-font",
              )}
              variant={isErrorState ? "destructive" : "default"}
              onClick={handlePlayBtnClick}
              disabled={isPlayButtonDisabled}
            >
              {playButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
