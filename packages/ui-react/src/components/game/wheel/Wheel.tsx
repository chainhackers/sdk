import { useEffect, useState } from "react"
import wheel from "../../../assets/game/wheel.svg"
import wheelArrow from "../../../assets/game/wheel-arrow.svg"
import { GameMultiplierDisplay } from "../shared/GameMultiplierDisplay"

interface WheelProps {
  rotationAngle: number
  isSpinning: boolean
  multiplier: number
  hasResult?: boolean
}

export function Wheel({ rotationAngle, isSpinning, multiplier, hasResult = false }: WheelProps) {
  const [currentAngle, setCurrentAngle] = useState(0)

  useEffect(() => {
    if (rotationAngle !== currentAngle) {
      setCurrentAngle(rotationAngle)
    }
  }, [rotationAngle, currentAngle])

  return (
    <>
      <div className="relative w-[192px] h-[148px] mx-auto">
        <div
          className="absolute inset-0 flex items-center justify-center top-[12px]"
          style={{
            transform: `rotate(${currentAngle}deg)`,
            transition: isSpinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
          }}
        >
          <img src={wheel} alt="Wheel colors" className="w-full h-full object-contain" />
        </div>
        {hasResult && !isSpinning && (
          <GameMultiplierDisplay
            multiplier={multiplier}
            className="absolute text-black top-[80px] text-[18px]"
          />
        )}
      </div>
      <img src={wheelArrow} alt="Wheel arrow" className="absolute" />
    </>
  )
}
