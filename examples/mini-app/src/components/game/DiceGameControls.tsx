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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-2 w-full max-w-md flex flex-col items-center">
        <div className="bg-white/80 rounded-md p-2 h-[40px] w-[188px] flex items-center">
          <Slider
            value={[selectedNumber]}
            onValueChange={handleSliderChange}
            min={1}
            max={99}
            step={1}
            className="w-full"
            invertFill={true}
          />
        </div>
        <div className="flex justify-between items-center text-[12px] text-[#E5E7EB]/80 w-[188px] h-[20px] pl-3 pr-2">
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
