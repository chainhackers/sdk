import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DiceGameProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark' | 'system';
  customTheme?: React.CSSProperties;
}

export function DiceGame({
  theme = 'system',
  customTheme,
  className,
  ...props
}: DiceGameProps) {
  const [sliderValue, setSliderValue] = useState([25]);
  const [betAmount, setBetAmount] = useState('1');

  const multiplier = (99 / (99 - sliderValue[0])).toFixed(2);
  const targetPayout = (parseFloat(betAmount || '0') * parseFloat(multiplier)).toFixed(2);
  const winChance = (99 - sliderValue[0]);
  const fee = 0;

  const themeClass = theme === 'system' ? undefined : theme;

  return (
    <div
      className={cn(
        "dice-game-wrapper",
        themeClass,
        className
      )}
      style={customTheme}
      {...props}
    >
      <Card className={cn(
          "w-[380px] relative overflow-hidden",
          "bg-card text-card-foreground rounded-lg border",
          "shadow-md"
      )}>
         <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="iconRound"
              className={cn("absolute top-4 right-4 z-10")}
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

        <CardContent className="flex flex-col gap-4 pt-6">
          <div
            className={cn(
              "h-[150px] rounded-md flex flex-col justify-end items-center p-4 relative bg-cover bg-center",
              "border",
              "bg-muted"
            )}
          >
             <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-foreground" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
               {multiplier}x
             </div>

            <Slider
              defaultValue={[25]}
              value={sliderValue}
              onValueChange={setSliderValue}
              max={99}
              step={1}
              className={cn("w-[90%]")}
            />
            <div className="w-[90%] flex justify-between text-xs text-muted-foreground mt-1 px-1">
              <span>0</span>
              <span>50</span>
              <span>99</span>
            </div>
          </div>

           <Input
             type="number"
             placeholder="Enter bet amount"
             value={betAmount}
             onChange={(e: ChangeEvent<HTMLInputElement>) => setBetAmount(e.target.value)}
             className="bg-input border-0"
           />

           <div className="grid grid-cols-3 gap-2">
             <Button
               variant="secondary"
               onClick={() => setBetAmount(prev => (parseFloat(prev || '0') / 2).toString())}
               className="border-0"
             >
               1/2
             </Button>
             <Button
               variant="secondary"
               onClick={() => setBetAmount(prev => (parseFloat(prev || '0') * 2).toString())}
               className="border-0"
              >
               2x
             </Button>
             <Button
               variant="secondary"
               className="border-0"
             >
               Max
             </Button>
           </div>
        </CardContent>

        <CardFooter>
          <Button size="lg" className={cn("w-full", "border-0", "bg-primary hover:bg-primary/90 text-primary-foreground")}>
            Place bet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
