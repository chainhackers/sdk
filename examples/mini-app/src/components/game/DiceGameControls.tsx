import { Slider } from "../ui/slider"

interface DiceGameControlsProps {
  selectedNumber: number
  onNumberChange: (value: number) => void
  multiplier: number
}

export function DiceGameControls({
  selectedNumber,
  onNumberChange,
  multiplier,
}: DiceGameControlsProps) {
  const handleSliderChange = (values: number[]) => {
    onNumberChange(values[0])
  }

  return (
    <>
      <div className="absolute top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold leading-[34px] text-white">
        {multiplier.toFixed(2)} x
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-2 w-full max-w-md">
        <div className="px-4">
          <Slider
            value={[selectedNumber]}
            onValueChange={handleSliderChange}
            min={1}
            max={99}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[#E5E7EB]/80 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>99</span>
          </div>
        </div>
      </div>
    </>
  )
}
