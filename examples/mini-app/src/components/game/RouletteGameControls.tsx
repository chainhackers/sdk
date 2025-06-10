import { RouletteNumber, ROULETTE_INPUT_BUNDLE } from "@betswirl/sdk-core"
import { Button } from "../ui/button"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

interface RouletteGameControlsProps extends GameControlsProps {
  selectedNumbers: RouletteNumber[]
  onNumbersChange: (numbers: RouletteNumber[]) => void
}

const RED_NUMBERS: RouletteNumber[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]
const BLACK_NUMBERS: RouletteNumber[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]

export function RouletteGameControls({
  selectedNumbers,
  onNumbersChange,
  multiplier,
  isDisabled,
}: RouletteGameControlsProps) {
  const isNumberSelected = (number: RouletteNumber) =>
    selectedNumbers.includes(number)

  const getNumberColor = (number: RouletteNumber) => {
    if (number === 0) return "green"
    return RED_NUMBERS.includes(number) ? "red" : "black"
  }

  const handleNumberClick = (number: RouletteNumber) => {
    if (isDisabled) return

    if (isNumberSelected(number)) {
      onNumbersChange(selectedNumbers.filter((n) => n !== number))
    } else {
      onNumbersChange([...selectedNumbers, number])
    }
  }

  const handleBundleClick = (bundle: ROULETTE_INPUT_BUNDLE) => {
    if (isDisabled) return

    let bundleNumbers: RouletteNumber[] = []

    switch (bundle) {
      case ROULETTE_INPUT_BUNDLE.RED:
        bundleNumbers = RED_NUMBERS
        break
      case ROULETTE_INPUT_BUNDLE.BLACK:
        bundleNumbers = BLACK_NUMBERS
        break
      case ROULETTE_INPUT_BUNDLE.ODD:
        bundleNumbers = Array.from(
          { length: 18 },
          (_, i) => (i * 2 + 1) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.EVEN:
        bundleNumbers = Array.from(
          { length: 18 },
          (_, i) => ((i + 1) * 2) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN:
        bundleNumbers = Array.from(
          { length: 18 },
          (_, i) => (i + 1) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX:
        bundleNumbers = Array.from(
          { length: 18 },
          (_, i) => (i + 19) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (i + 1) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (i + 13) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (i + 25) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.FIRST_ROW:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (1 + i * 3) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.SECOND_ROW:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (2 + i * 3) as RouletteNumber,
        )
        break
      case ROULETTE_INPUT_BUNDLE.THIRD_ROW:
        bundleNumbers = Array.from(
          { length: 12 },
          (_, i) => (3 + i * 3) as RouletteNumber,
        )
        break
    }

    const allSelected = bundleNumbers.every((num) =>
      selectedNumbers.includes(num),
    )

    if (allSelected) {
      onNumbersChange(selectedNumbers.filter((n) => !bundleNumbers.includes(n)))
    } else {
      const newNumbers = [...selectedNumbers]
      bundleNumbers.forEach((num) => {
        if (!newNumbers.includes(num)) {
          newNumbers.push(num)
        }
      })
      onNumbersChange(newNumbers)
    }
  }

  const renderNumberButton = (number: RouletteNumber) => {
    const color = getNumberColor(number)
    const selected = isNumberSelected(number)

    let bgColor = ""
    let textColor = "text-white"

    if (selected) {
      bgColor = "bg-primary"
    } else {
      switch (color) {
        case "red":
          bgColor = "bg-[oklch(0.6273_0.1893_23.38)]"
          break
        case "black":
          bgColor = "bg-[oklch(0.343_0.0139_235.28)]"
          break
        case "green":
          bgColor = "bg-[oklch(0.784_0.1418_166.22)]"
          break
      }
    }

    return (
      <Button
        key={number}
        variant="ghost"
        size="sm"
        onClick={() => handleNumberClick(number)}
        disabled={isDisabled}
        className={`w-[22px] h-[22px] p-0 text-[10px] leading-5 font-semibold rounded-sm ${bgColor} ${textColor} hover:scale-105 transition-transform disabled:hover:scale-100`}
      >
        {number}
      </Button>
    )
  }

  const renderBundleButton = (
    bundle: ROULETTE_INPUT_BUNDLE,
    label: string,
    className?: string,
  ) => {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleBundleClick(bundle)}
        disabled={isDisabled}
        className={`${
          bundle === ROULETTE_INPUT_BUNDLE.FIRST_ROW ||
          bundle === ROULETTE_INPUT_BUNDLE.SECOND_ROW ||
          bundle === ROULETTE_INPUT_BUNDLE.THIRD_ROW
            ? "h-[22px] w-[22px]"
            : "h-[28px]"
        } px-2 text-[10px] leading-5 font-semibold rounded-sm transition-transform hover:scale-105 disabled:hover:scale-100 bg-[oklch(0.2398_0.0062_214.42)] text-white ${
          className || ""
        }`}
      >
        {label}
      </Button>
    )
  }

  const renderRowNumbers = (rowStart: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const number = (rowStart + i * 3) as RouletteNumber
      return renderNumberButton(number)
    })
  }

  const renderColorButton = (bundle: ROULETTE_INPUT_BUNDLE, isRed: boolean) => {
    const bgColor = isRed
      ? "bg-[oklch(0.6273_0.1893_23.38)]"
      : "bg-[oklch(0.343_0.0139_235.28)]"

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleBundleClick(bundle)}
        disabled={isDisabled}
        className={`h-[28px] flex-1 p-0 text-[10px] leading-5 font-semibold rounded-sm transition-transform hover:scale-105 disabled:hover:scale-100 ${bgColor}`}
      />
    )
  }

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} className="top-[23px]" />
      <div className="absolute bottom-[16px] left-[3.5px] w-[321px] h-[130px]">
        <div className="w-[321px] h-[130px] space-y-px">
          <div className="flex gap-px">
            <div className="flex flex-col justify-stretch h-[70px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNumberClick(0)}
                disabled={isDisabled}
                className={`w-[22px] h-full p-0 text-[12px] leading-5 font-bold rounded-sm transition-transform hover:scale-105 disabled:hover:scale-100 ${
                  isNumberSelected(0)
                    ? "bg-primary text-white"
                    : "bg-[oklch(0.784_0.1418_166.22)] text-white"
                }`}
              >
                0
              </Button>
            </div>

            <div className="w-[275px] grid grid-rows-3 gap-px">
              <div className="grid grid-cols-12 gap-px">
                {renderRowNumbers(3)}
              </div>
              <div className="grid grid-cols-12 gap-px">
                {renderRowNumbers(2)}
              </div>
              <div className="grid grid-cols-12 gap-px">
                {renderRowNumbers(1)}
              </div>
            </div>

            <div className="w-[22px] flex flex-col gap-px">
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.THIRD_ROW, "2:1")}
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.SECOND_ROW, "2:1")}
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.FIRST_ROW, "2:1")}
            </div>
          </div>

          <div className="flex gap-px">
            <div className="w-[22px]"></div>

            <div className="w-[275px] space-y-px">
              <div className="grid grid-cols-3 gap-px">
                {renderBundleButton(
                  ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE,
                  "1 to 12",
                )}
                {renderBundleButton(
                  ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR,
                  "13 to 24",
                )}
                {renderBundleButton(
                  ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX,
                  "25 to 36",
                )}
              </div>

              <div className="grid grid-cols-3 gap-px">
                <div className="grid grid-cols-2 gap-px">
                  {renderBundleButton(
                    ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN,
                    "1 to 18",
                  )}
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.EVEN, "Even")}
                </div>
                <div className="flex gap-0">
                  {renderColorButton(ROULETTE_INPUT_BUNDLE.BLACK, false)}
                  {renderColorButton(ROULETTE_INPUT_BUNDLE.RED, true)}
                </div>
                <div className="grid grid-cols-2 gap-px">
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.ODD, "Odd")}
                  {renderBundleButton(
                    ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX,
                    "19 to 36",
                  )}
                </div>
              </div>
            </div>

            <div className="w-[22px]"></div>
          </div>
        </div>
      </div>
    </>
  )
}
