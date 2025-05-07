import React, { useState, ChangeEvent, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Label } from "../ui/label"
import { Info, History, Cog, XIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import coinTossBackground from "../../assets/game/game-background.png"
import coinIcon from "../../assets/game/coin-background-icon.png"

import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetPortal,
  SheetOverlay,
} from "../ui/sheet"
import * as SheetPrimitive from "@radix-ui/react-dialog"

export interface CoinTossGameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
  customTheme?: React.CSSProperties
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

  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div
      className={cn("cointoss-game-wrapper", themeClass, className)}
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
          <CardTitle className="text-lg">CoinToss</CardTitle>
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
            <div className="absolute inset-0 bg-black/40 rounded-[16px]"></div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn("absolute top-2 left-2", "text-white")}
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

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn("absolute top-2 right-2", "text-white")}
                >
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              {isMounted && cardRef.current && (
                <SheetPortal container={cardRef.current}>
                  <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
                  <SheetPrimitive.Content
                    className={cn(
                      "bg-card data-[state=open]:animate-in data-[state=closed]:animate-out !absolute z-50 flex flex-col gap-0 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
                      "!inset-x-0 !bottom-0 !w-full !h-[70%] !max-h-full !border-t",
                      "data-[state=closed]:!slide-out-to-bottom data-[state=open]:!slide-in-from-bottom",
                    )}
                  >
                    <SheetHeader className="!p-3 sm:!p-4 !text-left">
                      <SheetTitle>Transaction History</SheetTitle>
                      <SheetDescription>
                        Your transaction history will be displayed here.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                      <p className="text-sm text-muted-foreground">
                        (Transaction history will be displayed here...)
                      </p>
                      <ul>
                        <li className="py-1">Bet 1: Win X POL</li>
                        <li className="py-1">Bet 2: Loss Y POL</li>
                        <li className="py-1">Bet 3: Win Z POL</li>
                      </ul>
                    </div>
                    <SheetFooter className="!p-3 sm:!p-4 !mt-0">
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                    <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-3 right-3 sm:top-4 sm:right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </SheetPrimitive.Close>
                  </SheetPrimitive.Content>
                </SheetPortal>
              )}
            </Sheet>

            <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white dark:text-foreground">
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
                <span className="text-muted-foreground">Balance:&nbsp;</span>
                <span className="font-semibold">0</span>
                <Cog className="inline h-4 w-4 ml-1 text-orange-500" />
              </div>

              <Label
                htmlFor="betAmount"
                className="text-sm font-medium -mb-1 text-muted-foreground"
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
                  className="border border-secondary-border rounded-[8px] h-[30px] w-[85.33px]"
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
                  className="border border-secondary-border rounded-[8px] h-[30px] w-[85.33px]"
                >
                  2x
                </Button>
                <Button
                  variant="secondary"
                  className="border border-secondary-border rounded-[8px] h-[30px] w-[85.33px]"
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
                "bg-primary hover:bg-primary/90 text-primary-foreground font-bold",
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
