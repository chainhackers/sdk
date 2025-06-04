import { Slider } from "../ui/slider"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"

interface DiceGameControlsProps {
  selectedNumber: number
  onNumberChange: (value: number) => void
  multiplier: number
  isDisabled: boolean
}

export function DiceGameControls({
  selectedNumber,
  onNumberChange,
  multiplier,
  isDisabled,
}: DiceGameControlsProps) {
  const handleSliderChange = (values: number[]) => {
    onNumberChange(values[0])
  }

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-2 w-full max-w-md flex flex-col items-center">
        <div className="bg-white/80 rounded-md p-2 h-[40px] w-[188px] flex items-center">
          <Slider
            value={[selectedNumber]}
            onValueChange={handleSliderChange}
            min={1}
            max={99}
            step={1}
            disabled={isDisabled}
            className="w-[172px] h-[8px]"
          />
        </div>
        <div className="flex justify-between items-center text-[12px] text-muted/80 w-[188px] h-[20px] pl-3 pr-2">
          <span>1</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>99</span>
        </div>
      </div>
    </>
  )
}
