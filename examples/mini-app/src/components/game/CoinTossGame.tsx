import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Info, History, Cog } from 'lucide-react';
import { cn } from '../../lib/utils';
import coinTossBackground from '../../assets/game/game-background.png';

export interface CoinTossGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark' | 'system';
  customTheme?: React.CSSProperties;
}

export function CoinTossGame({
  theme = 'system',
  customTheme,
  className,
  ...props
}: CoinTossGameProps) {
  const [betAmount, setBetAmount] = useState('0');
  const [choice] = useState<'Heads' | 'Tails'>('Heads');

  const multiplier = 1.94;
  const winChance = 50;
  const targetPayout = (parseFloat(betAmount || '0') * multiplier).toFixed(2);
  const fee = 0;

  const themeClass = theme === 'system' ? undefined : theme;

  return (
    <div
      className={cn(
        "cointoss-game-wrapper",
        themeClass,
        className
      )}
      style={customTheme}
      {...props}
    >
      <Card className={cn(
          "w-[328px] h-[512px] relative overflow-hidden",
          "bg-card text-card-foreground rounded-lg border",
          "shadow-md",
      )}>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-left text-lg">CoinToss</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-2">
          <div
            className={cn(
              "h-[160px] rounded-[16px] flex flex-col justify-end items-center p-4 relative bg-cover bg-center bg-no-repeat",
              "bg-muted"
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
                  className={cn(
                    "absolute top-3 left-3",
                    "text-white"
                  )}
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
                       <span className="text-muted-foreground">Target Payout:</span>
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
              className={cn(
                "absolute top-3 right-3",
                "text-white"
              )}
              onClick={() => alert('History clicked!')}
            >
              <History className="h-4 w-4" />
            </Button>

            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white dark:text-foreground" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              {multiplier.toFixed(2)}x
            </div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-2 h-16 w-16 rounded-full flex items-center justify-center text-primary-foreground font-bold bg-primary"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(0,0,0,0.1)' }}
            >
              {choice}
            </div>
          </div>

          <div className="flex flex-col gap-2">
             <div className="text-sm text-muted-foreground flex items-center">
                Balance: 0
                <Cog className="inline h-4 w-4 ml-1" />
             </div>

             <Label htmlFor="betAmount" className="text-sm font-medium -mb-1">Bet amount</Label>
             <Input
               id="betAmount"
               type="number"
               placeholder="0"
               value={betAmount}
               onChange={(e: ChangeEvent<HTMLInputElement>) => setBetAmount(e.target.value)}
               token={{
                 icon: <Cog className="h-4 w-4 text-orange-500" />,
                 symbol: "POL"
               }}
             />

             <div className="grid grid-cols-3 gap-2">
               <Button
                 variant="secondary"
                 onClick={() => setBetAmount(prev => (parseFloat(prev || '0') / 2).toString())}
                 className="border-0 rounded-[8px]"
               >
                 1/2
               </Button>
               <Button
                 variant="secondary"
                 onClick={() => setBetAmount(prev => (parseFloat(prev || '0') * 2).toString())}
                 className="border-0 rounded-[8px]"
                >
                 2x
               </Button>
               <Button
                 variant="secondary"
                 className="border-0 rounded-[8px]"
                 onClick={() => alert('Max clicked!')}
               >
                 Max
               </Button>
             </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            size="lg"
            className={cn(
              "w-full",
              "border-0",
              "bg-primary hover:bg-primary/90 text-primary-foreground font-bold",
              "rounded-[16px]"
            )}
            onClick={() => alert(`Betting ${betAmount} POL on ${choice}`)}
          >
            Connect
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
