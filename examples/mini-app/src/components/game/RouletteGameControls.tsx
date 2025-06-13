import { ROULETTE_INPUT_BUNDLE, RouletteNumber } from "@betswirl/sdk-core"
import chipSvg from "../../assets/game/roulette-chip.svg"
import chipDisabledSvg from "../../assets/game/roulette-chip-disabled.svg"
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

type RouletteColor = "red" | "black" | "green"

interface ButtonColorConfig {
  bg: string
  hover: string
}

const ROULETTE_COLORS: Record<RouletteColor, ButtonColorConfig> = {
  red: {
    bg: "bg-roulette-red roulette-button-shadow-red",
    hover: "hover:bg-roulette-red-hover",
  },
  black: {
    bg: "bg-roulette-black roulette-button-shadow-black",
    hover: "hover:bg-roulette-black-hover",
  },
  green: {
    bg: "bg-roulette-green roulette-button-shadow-green",
    hover: "hover:bg-roulette-green-hover",
  },
}

const BUNDLE_COLORS: ButtonColorConfig = {
  bg: "bg-roulette-bundle roulette-button-shadow-bundle",
  hover: "hover:bg-roulette-bundle-hover",
}

const getBundleStyles = (isDisabled = false): string => {
  const shadowClass = isDisabled
    ? "roulette-button-shadow-disabled"
    : "roulette-button-shadow-bundle"
  return `bg-roulette-bundle ${shadowClass} ${BUNDLE_COLORS.hover}`
}

const DISABLED_STYLES =
  "disabled:bg-roulette-disabled disabled:text-roulette-disabled-text disabled:opacity-100"
const COMMON_BUTTON_STYLES = "text-white hover:text-white disabled:hover:bg-opacity-100"

const getNumberColor = (number: RouletteNumber): RouletteColor => {
  if (number === 0) return "green"
  return RED_NUMBERS.includes(number) ? "red" : "black"
}

const getColorStyles = (color: RouletteColor, isDisabled = false): string => {
  const colorConfig = ROULETTE_COLORS[color]
  const shadowClass = isDisabled ? "roulette-button-shadow-disabled" : colorConfig.bg.split(" ")[1]
  const bgClass = colorConfig.bg.split(" ")[0]
  return `${bgClass} ${shadowClass} ${colorConfig.hover}`
}

export function RouletteGameControls({
  selectedNumbers,
  onNumbersChange,
  multiplier,
  isDisabled,
}: RouletteGameControlsProps) {
  const isNumberSelected = (number: RouletteNumber) => selectedNumbers.includes(number)

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
        bundleNumbers = Array.from({ length: 18 }, (_, i) => (i * 2 + 1) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.EVEN:
        bundleNumbers = Array.from({ length: 18 }, (_, i) => ((i + 1) * 2) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN:
        bundleNumbers = Array.from({ length: 18 }, (_, i) => (i + 1) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX:
        bundleNumbers = Array.from({ length: 18 }, (_, i) => (i + 19) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (i + 1) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (i + 13) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (i + 25) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.FIRST_ROW:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (1 + i * 3) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.SECOND_ROW:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (2 + i * 3) as RouletteNumber)
        break
      case ROULETTE_INPUT_BUNDLE.THIRD_ROW:
        bundleNumbers = Array.from({ length: 12 }, (_, i) => (3 + i * 3) as RouletteNumber)
        break
    }

    const allSelected = bundleNumbers.every((num) => selectedNumbers.includes(num))

    if (allSelected) {
      onNumbersChange(selectedNumbers.filter((n) => !bundleNumbers.includes(n)))
    } else {
      const newNumbers = [...selectedNumbers]
      for (const num of bundleNumbers) {
        if (!newNumbers.includes(num)) {
          newNumbers.push(num)
        }
      }
      onNumbersChange(newNumbers)
    }
  }

  const renderNumberButton = (number: RouletteNumber) => {
    const color = getNumberColor(number)
    const selected = isNumberSelected(number)
    const colorStyles = getColorStyles(color, isDisabled)

    return (
      <Button
        key={number}
        variant="ghost"
        size="sm"
        onClick={() => handleNumberClick(number)}
        disabled={isDisabled}
        className={`relative w-[22px] h-[22px] p-0 text-[10px] leading-5 font-semibold rounded-sm ${colorStyles} ${COMMON_BUTTON_STYLES} ${DISABLED_STYLES}`}
      >
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={isDisabled ? chipDisabledSvg : chipSvg}
              alt="Selected"
              className="absolute w-full h-full top-0 left-0"
            />
            <span className="relative z-10 text-white text-[10px]">{number}</span>
          </div>
        )}
        {!selected && <span className="disabled:text-roulette-disabled-text">{number}</span>}
      </Button>
    )
  }

  const renderBundleButton = (bundle: ROULETTE_INPUT_BUNDLE, label: string, className?: string) => {
    const isRowButton = [
      ROULETTE_INPUT_BUNDLE.FIRST_ROW,
      ROULETTE_INPUT_BUNDLE.SECOND_ROW,
      ROULETTE_INPUT_BUNDLE.THIRD_ROW,
    ].includes(bundle)

    const sizeClass = isRowButton ? "flex-1 w-[22px]" : "h-[28px]"
    const bundleStyles = getBundleStyles(isDisabled)

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleBundleClick(bundle)}
        disabled={isDisabled}
        className={`${sizeClass} px-2 text-[10px] leading-5 font-semibold rounded-sm ${bundleStyles} ${COMMON_BUTTON_STYLES} ${DISABLED_STYLES} ${
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
    const color: RouletteColor = isRed ? "red" : "black"
    const colorStyles = getColorStyles(color, isDisabled)

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleBundleClick(bundle)}
        disabled={isDisabled}
        className={`h-[28px] flex-1 p-0 text-[10px] leading-5 font-semibold rounded-sm ${colorStyles} ${COMMON_BUTTON_STYLES} ${DISABLED_STYLES}`}
      />
    )
  }

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} className="top-[23px]" />
      <div className="absolute bottom-[16px] left-[2.5px] w-[321px] h-[130px]">
        <div className="w-[321px] h-[130px] space-y-0.5">
          <div className="flex gap-0.5">
            <div className="flex flex-col justify-stretch h-[70px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNumberClick(0)}
                disabled={isDisabled}
                className={`relative w-[22px] h-full p-0 text-[12px] leading-5 font-bold rounded-sm ${getColorStyles(
                  "green",
                  isDisabled,
                )} ${COMMON_BUTTON_STYLES} ${DISABLED_STYLES}`}
              >
                {isNumberSelected(0) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={isDisabled ? chipDisabledSvg : chipSvg}
                      alt="chip"
                      className="absolute w-full h-full top-0 left-0 object-contain"
                    />
                    <span className="relative z-10 text-white font-bold text-[12px]">0</span>
                  </div>
                )}
                {!isNumberSelected(0) && (
                  <span className="disabled:text-roulette-disabled-text">0</span>
                )}
              </Button>
            </div>

            <div className="w-[275px] grid grid-rows-3 gap-0.5">
              <div className="grid grid-cols-12 gap-0.5">{renderRowNumbers(3)}</div>
              <div className="grid grid-cols-12 gap-0.5">{renderRowNumbers(2)}</div>
              <div className="grid grid-cols-12 gap-0.5">{renderRowNumbers(1)}</div>
            </div>

            <div className="w-[22px] flex flex-col gap-0.5">
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.THIRD_ROW, "2:1")}
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.SECOND_ROW, "2:1")}
              {renderBundleButton(ROULETTE_INPUT_BUNDLE.FIRST_ROW, "2:1")}
            </div>
          </div>

          <div className="flex gap-0.5">
            <div className="w-[22px]" />

            <div className="w-[275px] space-y-0.5">
              <div className="grid grid-cols-3 gap-0.5">
                {renderBundleButton(ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE, "1 to 12")}
                {renderBundleButton(ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR, "13 to 24")}
                {renderBundleButton(ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX, "25 to 36")}
              </div>

              <div className="grid grid-cols-3 gap-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN, "1 to 18")}
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.EVEN, "Even")}
                </div>
                <div className="flex gap-0.5">
                  {renderColorButton(ROULETTE_INPUT_BUNDLE.BLACK, false)}
                  {renderColorButton(ROULETTE_INPUT_BUNDLE.RED, true)}
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.ODD, "Odd")}
                  {renderBundleButton(ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX, "19 to 36")}
                </div>
              </div>
            </div>

            <div className="w-[22px]" />
          </div>
        </div>
      </div>
    </>
  )
}
