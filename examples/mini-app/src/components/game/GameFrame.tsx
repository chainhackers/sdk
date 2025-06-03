import { History, Info } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BetStatus, GameResult } from "../../types"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { GameResultWindow } from "./GameResultWindow"
import { HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"
import { BettingPanel } from "./BettingPanel"

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
  onPlayBtnClick: () => void
  gameResult: GameResult | null
  betStatus: BetStatus | null
  onHistoryOpen: () => void
  betAmount: bigint | undefined
  onBetAmountChange: (amount: bigint | undefined) => void
  tokenDecimals: number
  targetPayoutAmount: bigint
  vrfFees: number | string
  gasPrice: number | string
  gameControls: React.ReactNode
  areChainsSynced: boolean
}

export function GameFrame({
  themeSettings,
  historyData,
  balance,
  connectWallletBtn,
  isConnected,
  onPlayBtnClick,
  gameResult,
  betStatus,
  onHistoryOpen,
  betAmount,
  onBetAmountChange,
  tokenDecimals,
  targetPayoutAmount,
  vrfFees,
  gasPrice,
  gameControls,
  areChainsSynced,
  ...props
}: GameFrameProps) {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = themeSettings

  const themeClass = theme === "system" ? undefined : theme

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleHistoryOpen = (open: boolean) => {
    if (open) {
      onHistoryOpen()
    }
    setIsHistorySheetOpen(open)
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
            />

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
                  winChance={50}
                  rngFee={vrfFees}
                  targetPayout={targetPayoutAmount.toString()}
                  gasPrice={gasPrice}
                  token={{
                    symbol: "ETH",
                    decimals: tokenDecimals,
                    address:
                      "0x0000000000000000000000000000000000000000" as `0x${string}`,
                  }}
                />
              )}
            </Sheet>

            <Sheet open={isHistorySheetOpen} onOpenChange={handleHistoryOpen}>
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

          <BettingPanel
            balance={balance}
            isConnected={isConnected}
            tokenDecimals={tokenDecimals}
            betStatus={betStatus}
            betAmount={betAmount}
            onBetAmountChange={onBetAmountChange}
            onPlayBtnClick={onPlayBtnClick}
            areChainsSynced={areChainsSynced}
          />
        </CardContent>
      </Card>
    </div>
  )
}
