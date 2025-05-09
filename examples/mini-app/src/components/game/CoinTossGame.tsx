import { Cog, History, Info } from "lucide-react";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import coinIcon from "../../assets/game/coin-background-icon.png";
import coinTossBackground from "../../assets/game/game-background.png";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { Sheet, SheetTrigger } from "../ui/sheet";
import { type HistoryEntry, HistorySheetPanel } from "./HistorySheetPanel";
import { InfoSheetPanel } from "./InfoSheetPanel";

export interface CoinTossGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system";
  customTheme?: React.CSSProperties;
}

const mockHistoryData: HistoryEntry[] = [
  {
    id: "1",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: "1.94675",
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~24h ago",
  },
  {
    id: "2",
    status: "Won bet",
    multiplier: 1.2,
    payoutAmount: 0.2,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "3",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "4",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "5",
    status: "Busted",
    multiplier: 1.94,
    payoutAmount: 1.94,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "6",
    status: "Won bet",
    multiplier: 1.946,
    payoutAmount: 2.453,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "7",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "8",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
  {
    id: "9",
    status: "Won bet",
    multiplier: 1.94,
    payoutAmount: 0.1,
    payoutCurrencyIcon: <Cog className="h-3.5 w-3.5 text-orange-500" />,
    timestamp: "~2h ago",
  },
];

export function CoinTossGame({
  theme = "system",
  customTheme,
  className,
  ...props
}: CoinTossGameProps) {
  const [betAmount, setBetAmount] = useState("0");
  const [choice] = useState<"Heads" | "Tails">("Heads");
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);

  const multiplier = 1.94;
  const winChance = 50;
  const targetPayout = (Number.parseFloat(betAmount || "0") * multiplier).toFixed(2);
  const fee = 0;

  const themeClass = theme === "system" ? undefined : theme;

  const cardRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn("cointoss-game-wrapper", themeClass, className)}
      style={customTheme}
      {...props}
    >
      <Card
        ref={cardRef}
        className={cn("relative overflow-hidden", "bg-card text-card-foreground border")}
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

            <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 left-2",
                    "text-white",
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

            <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="iconTransparent"
                  size="iconRound"
                  className={cn(
                    "absolute top-2 right-2",
                    "text-white",
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
                Bet amount
              </Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="0"
                value={betAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBetAmount(e.target.value)}
                token={{
                  icon: <Cog className="h-4 w-4 text-orange-500" />,
                  symbol: "POL",
                }}
              />

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setBetAmount((prev) => (Number.parseFloat(prev || "0") / 2).toString())
                  }
                  className="border border-secondary-border rounded-[8px] h-[30px] w-[85.33px]"
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setBetAmount((prev) => (Number.parseFloat(prev || "0") * 2).toString())
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
  );
}
