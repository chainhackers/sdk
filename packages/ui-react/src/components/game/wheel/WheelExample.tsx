import { CASINO_GAME_TYPE } from "@betswirl/sdk-core"
import { useState } from "react"
import { Button } from "../../ui/button"
import { WheelGameControls } from "../WheelGameControls"

const exampleWheelConfig = {
  configId: 0,
  chainId: 137 as const,
  game: CASINO_GAME_TYPE.WHEEL,
  weights: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
  multipliers: [0n, 14580n, 0n, 18760n, 0n, 20830n, 0n, 14580n, 0n, 31250n],
  colors: [
    "#29384C",
    "#55DC36",
    "#29384C",
    "#15A2D8",
    "#29384C",
    "#7340F4",
    "#29384C",
    "#55DC36",
    "#29384C",
    "#EC9E3C",
  ],
}

export function WheelExample() {
  const [winningMultiplier, setWinningMultiplier] = useState<number | undefined>()
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpin = () => {
    if (isSpinning) return

    setIsSpinning(true)

    const possibleMultipliers = exampleWheelConfig.multipliers
      .map((m) => Number(m))
      .filter((m) => m > 0)

    const randomMultiplier =
      possibleMultipliers[Math.floor(Math.random() * possibleMultipliers.length)]

    setTimeout(() => {
      setWinningMultiplier(randomMultiplier)
      setIsSpinning(false)
    }, 500)
  }

  const handleReset = () => {
    setWinningMultiplier(undefined)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Wheel Game Example</h2>

      <div className="relative h-96 mb-8">
        <WheelGameControls
          config={exampleWheelConfig}
          winningMultiplier={winningMultiplier}
          multiplier={2.5}
          isDisabled={isSpinning}
        />
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={handleSpin} disabled={isSpinning} className="px-6 py-2">
          {isSpinning ? "Spinning..." : "Spin Wheel"}
        </Button>

        <Button onClick={handleReset} variant="outline" className="px-6 py-2">
          Reset
        </Button>
      </div>

      {winningMultiplier && (
        <div className="mt-4 text-center">
          <p className="text-lg">
            Result: <span className="font-bold">{(winningMultiplier / 10000).toFixed(2)}x</span>
          </p>
        </div>
      )}
    </div>
  )
}
