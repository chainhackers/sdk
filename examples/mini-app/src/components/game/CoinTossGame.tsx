import React, { useState, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Label } from "../ui/label"
import { Info, History, Cog } from "lucide-react"
import { cn } from "../../lib/utils"
import coinTossBackground from "../../assets/game/game-background.png"
import coinIcon from "../../assets/game/coin-background-icon.png"

export interface CoinTossGameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: {
    "--primary"?: string
    "--play-btn-font"?: string
    "--game-window-overlay"?: string
  } & React.CSSProperties
}

export function CoinTossGame({
  theme = "system",
  customTheme,
  className,
  ...props
}: CoinTossGameProps) {
  const [betAmount, setBetAmount] = useState("0")
  const [choice] = useState<"Heads" | "Tails">("Heads")

  const multiplier = 1.94
  const winChance = 50
  const targetPayout = (parseFloat(betAmount || "0") * multiplier).toFixed(2)
  const fee = 0

  const themeClass = theme === "system" ? undefined : theme

  const gameWindowOverlay = customTheme && '--game-window-overlay' in customTheme 
    ? 'bg-[var(--game-window-overlay)]'
    : ''

  return (
    <div
      className={cn("cointoss-game-wrapper", themeClass, className)}
      style={customTheme}
      {...props}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          "bg-card text-card-foreground border",
        )}
      >
        <CardHeader className="flex flex-row justify-between items-center h-[44px]">
          <CardTitle className="text-lg text-title-color">CoinToss</CardTitle>
          <Button
            variant="secondary"
            className={cn(
              "bg-button-neutral-background",
              "rounded-[12px]",
              "border border-secondary-border",
              "text-primary",
            )}
          >
            Connect
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div
            className={cn(
              "h-[160px] rounded-[16px] flex flex-col justify-end items-center relative bg-cover bg-center bg-no-repeat",
              "bg-muted",
            )}
            style={{
              backgroundImage: `url(${coinTossBackground})`,
            }}
          >
            <div className={cn("absolute inset-0 rounded-[16px]", gameWindowOverlay)}></div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn("absolute top-2 left-2", "text-white border border-border-stroke")}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-60")}>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium leading-none">Bet Details</h4>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Target Payout:
                      </span>
                      <span>{targetPayout} POL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Chance:</span>
                      <span>{winChance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span>{fee} POL</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="iconTransparent"
              size="iconRound"
              className={cn("absolute top-2 right-2", "text-white border border-border-stroke")}
              onClick={() => alert("History clicked!")}
            >
              <History className="h-4 w-4" />
            </Button>

            <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
              {multiplier.toFixed(2)} x
            </div>
            <img
              src={coinIcon}
              alt="Coin"
              className="absolute top-[62px] left-1/2 transform -translate-x-1/2 mt-2 h-16 w-16"
            />
          </div>

          <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium flex items-center">
                <span className="text-text-on-surface-variant">Balance:&nbsp;</span>
                <span className="font-semibold">0</span>
                <Cog className="inline h-4 w-4 ml-1 text-orange-500" />
              </div>

              <Label
                htmlFor="betAmount"
                className="text-sm font-medium -mb-1 text-text-on-surface-variant"
              >
                Bet amount (0.24$)
              </Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="0"
                value={betAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBetAmount(e.target.value)
                }
                className="relative"
                token={{
                  icon: <Cog className="h-4 w-4 text-orange-500" />,
                  symbol: "POL",
                }}
              />

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setBetAmount((prev) =>
                      (parseFloat(prev || "0") / 2).toString(),
                    )
                  }
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setBetAmount((prev) =>
                      (parseFloat(prev || "0") * 2).toString(),
                    )
                  }
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                >
                  2x
                </Button>
                <Button
                  variant="secondary"
                  className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
                  onClick={() => alert("Max clicked!")}
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
              onClick={() => alert(`Betting ${betAmount} POL on ${choice}`)}
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
