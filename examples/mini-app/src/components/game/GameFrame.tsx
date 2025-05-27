import { History, Info } from "lucide-react"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"
import { FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { parseUnits } from "viem"
import Decimal from "decimal.js"

import { TokenImage } from "@coinbase/onchainkit/token"

import { Sheet, SheetTrigger } from "../ui/sheet"
import { HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { ETH_TOKEN } from "../../lib/tokens"
import { GameResultWindow } from "./GameResultWindow"
import { BetStatus, CoinTossResult, DiceResult } from "../../types"

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
  balance: bigint
  connectWallletBtn: React.ReactNode
  isConnected: boolean
  tokenDecimals: number
  gameResult: CoinTossResult | DiceResult | null
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  setBetAmount: (amount: bigint | undefined) => void
  targetPayoutAmount: bigint
  onHalfBet: () => void
  onDoubleBet: () => void
  onMaxBet: () => void
  onPlayBtnClick: () => void
  gameControls?: React.ReactNode
}

const STEP = 0.0001

export function GameFrame({
  themeSettings,
  historyData,
  balance,
  connectWallletBtn,
  isConnected,
  tokenDecimals,
  gameResult,
  betStatus,
  betAmount,
  setBetAmount,
  targetPayoutAmount,
  onHalfBet,
  onDoubleBet,
  onMaxBet,
  onPlayBtnClick,
  gameControls,
  ...props
}: GameFrameProps) {
  const [betAmountError, setBetAmountError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [isValidInput, setIsValidInput] = useState<boolean>(true)
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = themeSettings

  const themeClass = theme === "system" ? undefined : theme

  useEffect(() => {
    setIsMounted(true)

    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Sync inputValue with external betAmount changes from buttons (but not when user is typing)
  useEffect(() => {
    if (isUserTyping) return

    if (betAmount === undefined) {
      setInputValue("")
      setIsValidInput(true)
    } else {
      const formatted = formatRawAmount(
        betAmount,
        tokenDecimals,
        FORMAT_TYPE.PRECISE,
      )
      setInputValue(formatted)
      setIsValidInput(true)
    }
  }, [betAmount, tokenDecimals, isUserTyping])

  const isBetAmountValid = betAmount && betAmount > 0n

  const winChance = 50
  const targetPayout = formatRawAmount(targetPayoutAmount, tokenDecimals)
  const fee = 0

  const formattedBalance = formatRawAmount(balance, tokenDecimals)

  const isInGameResultState = !!gameResult
  const isBettingInProgress = betStatus === "pending"
  const canInitiateBet = isConnected && isBetAmountValid && !isBettingInProgress

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
      setBetAmount(0n)
      setInputValue("")
    }
    onPlayBtnClick()
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

            {gameControls}
            <GameResultWindow
              isVisible={!!gameResult}
              isWin={gameResult?.isWin}
              amount={betAmount || 0n}
              payout={gameResult?.payout}
              currency="ETH"
              rolled={gameResult?.rolled.toString() || ""}
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
                // Note: The real maximum is set by CoinTossGame and operates on the balance amount in bigint.
                // Converting formattedBalance to a float here may lose precision for large values;
                // however, a bigint-compatible approach is not required here because the actual maximum, if enforced,
                // is handled by CoinTossGame using the balance amount as bigint.
                max={Number.parseFloat(formattedBalance)}
                step={STEP}
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newInputValue = e.target.value
                  setInputValue(newInputValue)
                  setIsUserTyping(true)

                  // Clear existing timeout
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current)
                  }

                  // Set new timeout to stop typing state after 1 second
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsUserTyping(false)
                  }, 1000)

                  if (newInputValue === "") {
                    setBetAmount(undefined)
                    setIsValidInput(true)
                    setBetAmountError(null)
                    return
                  }

                  try {
                    new Decimal(newInputValue)

                    try {
                      const weiValue = parseUnits(newInputValue, tokenDecimals)
                      setBetAmount(weiValue)
                      setIsValidInput(true)
                      setBetAmountError(null)
                    } catch {
                      setIsValidInput(false)
                      setBetAmountError(null)
                    }
                  } catch {
                    setIsValidInput(false)
                    setBetAmountError(null)
                  }
                }}
                className={cn(
                  "relative",
                  !isValidInput && "[&_input]:text-muted-foreground",
                )}
                token={{
                  icon: <TokenImage token={ETH_TOKEN} size={16} />,
                  symbol: "ETH",
                }}
                disabled={
                  !isConnected || betStatus === "pending" || !!gameResult
                }
              />
              {betAmountError && (
                <div className="text-red-500 text-xs mt-1">
                  {betAmountError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={onHalfBet}
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  disabled={
                    !isConnected || isBettingInProgress || isInGameResultState
                  }
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={onDoubleBet}
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
                  onClick={onMaxBet}
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
