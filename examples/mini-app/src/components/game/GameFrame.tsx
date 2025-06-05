import { History, Info } from "lucide-react"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"
import { BetStatus, GameResult } from "../../types"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Sheet, SheetTrigger } from "../ui/sheet"
import { BettingPanel } from "./BettingPanel"
import { GameResultWindow } from "./GameResultWindow"
import { HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel"
import { InfoSheetPanel } from "./InfoSheetPanel"

interface ThemeSettings {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
  backgroundImage: string
}

interface GameFrameContextValue {
  themeSettings: ThemeSettings
  portalContainer: HTMLElement | null
  isInfoSheetOpen: boolean
  setIsInfoSheetOpen: (open: boolean) => void
  isHistorySheetOpen: boolean
  setIsHistorySheetOpen: (open: boolean) => void
  isMounted: boolean
}

const GameFrameContext = createContext<GameFrameContextValue | null>(null)

const useGameFrameContext = () => {
  const context = useContext(GameFrameContext)
  if (!context) {
    throw new Error("GameFrame compound components must be used within GameFrame")
  }
  return context
}

interface GameFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  themeSettings: ThemeSettings
  children: React.ReactNode
}

function GameFrameRoot({ themeSettings, children, ...props }: GameFrameProps) {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false)
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = themeSettings

  const themeClass = theme === "system" ? undefined : theme

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const contextValue: GameFrameContextValue = {
    themeSettings,
    portalContainer: cardRef.current,
    isInfoSheetOpen,
    setIsInfoSheetOpen,
    isHistorySheetOpen,
    setIsHistorySheetOpen,
    isMounted,
  }

  return (
    <GameFrameContext.Provider value={contextValue}>
      <div
        className={cn("cointoss-game-wrapper game-global-styles", themeClass, props.className)}
        style={themeSettings.customTheme as React.CSSProperties}
        {...props}
      >
        <Card
          ref={cardRef}
          className={cn("relative overflow-hidden", "bg-card text-card-foreground border")}
        >
          {children}
        </Card>
      </div>
    </GameFrameContext.Provider>
  )
}

interface HeaderProps {
  title: string
  connectWalletButton: React.ReactNode
}

function Header({ title, connectWalletButton }: HeaderProps) {
  return (
    <CardHeader className="flex flex-row justify-between items-center h-[44px]">
      <CardTitle className="text-lg text-title-color font-bold">{title}</CardTitle>
      {connectWalletButton}
    </CardHeader>
  )
}

interface GameAreaProps {
  children: React.ReactNode
}

function GameArea({ children }: GameAreaProps) {
  const { themeSettings } = useGameFrameContext()

  return (
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
        <div className={cn("absolute inset-0 rounded-[16px]", "bg-game-window-overlay")} />
        {children}
      </div>
    </CardContent>
  )
}

interface InfoButtonProps {
  winChance: number
  rngFee: number | string
  targetPayout: string
  gasPrice: number | string
  tokenDecimals: number
  nativeCurrencySymbol: string
}

function InfoButton({
  winChance,
  rngFee,
  targetPayout,
  gasPrice,
  tokenDecimals,
  nativeCurrencySymbol,
}: InfoButtonProps) {
  const { isInfoSheetOpen, setIsInfoSheetOpen, portalContainer, isMounted } = useGameFrameContext()

  return (
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
      {isMounted && portalContainer && (
        <InfoSheetPanel
          portalContainer={portalContainer}
          winChance={winChance}
          rngFee={rngFee}
          targetPayout={targetPayout}
          gasPrice={gasPrice}
          token={{
            symbol: "ETH",
            decimals: tokenDecimals,
            address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          }}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
      )}
    </Sheet>
  )
}

interface HistoryButtonProps {
  historyData: HistoryEntry[]
  onHistoryOpen: () => void
}

function HistoryButton({ historyData, onHistoryOpen }: HistoryButtonProps) {
  const { isHistorySheetOpen, setIsHistorySheetOpen, portalContainer, isMounted } =
    useGameFrameContext()

  const handleHistoryOpen = (open: boolean) => {
    if (open) {
      onHistoryOpen()
    }
    setIsHistorySheetOpen(open)
  }

  return (
    <Sheet open={isHistorySheetOpen} onOpenChange={handleHistoryOpen}>
      <SheetTrigger asChild>
        <Button
          variant="iconTransparent"
          size="iconRound"
          className={cn(
            "absolute top-2 right-2 z-[5]",
            "text-white border border-border-stroke bg-neutral-background",
            isHistorySheetOpen && "text-primary border-primary",
          )}
        >
          <History className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      {isMounted && portalContainer && (
        <HistorySheetPanel portalContainer={portalContainer} historyData={historyData} />
      )}
    </Sheet>
  )
}

interface GameControlsProps {
  children: React.ReactNode
}

function GameControls({ children }: GameControlsProps) {
  return <>{children}</>
}

interface ResultWindowProps {
  gameResult: GameResult | null
  betAmount: bigint | undefined
  currency?: string
}

function ResultWindow({ gameResult, betAmount, currency = "ETH" }: ResultWindowProps) {
  return (
    <GameResultWindow
      isVisible={!!gameResult}
      isWin={gameResult?.isWin}
      amount={betAmount || 0n}
      payout={gameResult?.payout}
      currency={currency}
      rolled={gameResult?.rolled.toString() || ""}
    />
  )
}

interface BettingPanelProps {
  balance: bigint
  isConnected: boolean
  tokenDecimals: number
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  onBetAmountChange: (amount: bigint | undefined) => void
  onPlayBtnClick: () => void
  areChainsSynced: boolean
}

function BettingSection(props: BettingPanelProps) {
  return <BettingPanel {...props} />
}

export const GameFrame = Object.assign(GameFrameRoot, {
  Header,
  GameArea,
  InfoButton,
  HistoryButton,
  GameControls,
  ResultWindow,
  BettingSection,
})
