import { ROULETTE_INPUT_BUNDLE, RouletteNumber } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import React from "react"
import { zeroAddress } from "viem"
import chipSvg from "../../assets/game/roulette-chip.svg?no-inline"
import { Button } from "../ui/button"
import { GameMultiplierDisplay } from "./shared/GameMultiplierDisplay"
import { GameControlsProps } from "./shared/types"

interface ChipWithTokenProps {
  number: RouletteNumber
  chipSize: number
  tokenSize: number
  tokenStyles?: string
  textStyles?: string
}

interface NumberButtonProps {
  number: RouletteNumber
  isSelected: boolean
  isDisabled: boolean
  onClick: (number: RouletteNumber) => void
}

interface BundleButtonProps {
  bundle: BundleType
  label?: string
  className?: string
  isDisabled: boolean
  onClick: (bundle: BundleType) => void
}

interface RouletteGameControlsProps extends GameControlsProps {
  selectedNumbers: RouletteNumber[]
  onNumbersChange: (numbers: RouletteNumber[]) => void
}

enum CUSTOM_ROW_BUNDLE {
  ROW_0 = "CUSTOM_ROW_0",
  ROW_1 = "CUSTOM_ROW_1",
  ROW_2 = "CUSTOM_ROW_2",
  ROW_3 = "CUSTOM_ROW_3",
}

type BundleType = ROULETTE_INPUT_BUNDLE | CUSTOM_ROW_BUNDLE

const RED_NUMBERS: RouletteNumber[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

const BLACK_NUMBERS: RouletteNumber[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]

const CUSTOM_ROW_NUMBERS: Record<CUSTOM_ROW_BUNDLE, RouletteNumber[]> = {
  [CUSTOM_ROW_BUNDLE.ROW_0]: [4, 8, 12, 16, 20, 24, 28, 32, 36],
  [CUSTOM_ROW_BUNDLE.ROW_1]: [3, 7, 11, 15, 19, 23, 27, 31, 35],
  [CUSTOM_ROW_BUNDLE.ROW_2]: [2, 6, 10, 14, 18, 22, 26, 30, 34],
  [CUSTOM_ROW_BUNDLE.ROW_3]: [1, 5, 9, 13, 17, 21, 25, 29, 33],
}

const NUMBER_GRID: RouletteNumber[][] = [
  CUSTOM_ROW_NUMBERS[CUSTOM_ROW_BUNDLE.ROW_0],
  CUSTOM_ROW_NUMBERS[CUSTOM_ROW_BUNDLE.ROW_1],
  CUSTOM_ROW_NUMBERS[CUSTOM_ROW_BUNDLE.ROW_2],
  CUSTOM_ROW_NUMBERS[CUSTOM_ROW_BUNDLE.ROW_3],
]

type RouletteColor = "red" | "black" | "green"

interface ButtonColorConfig {
  background: string
  hover: string
}

const ROULETTE_COLORS: Record<RouletteColor, ButtonColorConfig> = {
  red: {
    background: "bg-roulette-red",
    hover: "hover:bg-roulette-red-hover",
  },
  black: {
    background: "bg-roulette-black",
    hover: "hover:bg-roulette-black-hover",
  },
  green: {
    background: "bg-roulette-green",
    hover: "hover:bg-roulette-green-hover",
  },
}

const BUNDLE_COLORS: ButtonColorConfig = {
  background: "bg-roulette-bundle",
  hover: "hover:bg-roulette-bundle-hover",
}

const BUTTON_STYLES = {
  disabled: "disabled:opacity-[0.72]",
  common: "text-white hover:text-white disabled:hover:bg-opacity-100",
  number:
    "relative w-[25px] h-[25px] p-0 text-[10px] leading-5 font-semibold rounded-md shadow-none",
  bundle: "px-1 text-[10px] leading-5 font-semibold rounded-md shadow-none",
  rowButton: "w-[25px] h-[25px]",
  regularButton: "h-[25px]",
} as const

const getNumberColor = (number: RouletteNumber): RouletteColor => {
  if (number === 0) return "green"
  return RED_NUMBERS.includes(number) ? "red" : "black"
}

const getColorStyles = (color: RouletteColor): string => {
  const colorConfig = ROULETTE_COLORS[color]
  return `${colorConfig.background} ${colorConfig.hover}`
}

const getBundleStyles = (): string => {
  return `${BUNDLE_COLORS.background} ${BUNDLE_COLORS.hover}`
}

const ChipWithToken = React.memo<ChipWithTokenProps>(
  ({ number, chipSize, tokenSize, tokenStyles, textStyles }) => {
    // TODO: Pass actual token from game context instead of hardcoding
    const tempToken = {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      image: "https://www.betswirl.com/img/tokens/ETH.svg",
      chainId: 8453,
      name: "Ethereum"
    }
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={chipSvg} alt="Selected" className={`absolute ${chipSize}`} />
        <span className={`relative z-10 text-white ${textStyles || ""}`}>{number}</span>
        <div className={`absolute z-20 ${tokenStyles || ""}`}>
          <TokenImage token={tempToken} size={tokenSize} />
        </div>
      </div>
    )
  }
)

const NumberButton = React.memo<NumberButtonProps>(
  ({ number, isSelected, isDisabled, onClick }) => {
    const color = getNumberColor(number)
    const colorStyles = getColorStyles(color)
    const buttonClasses = `${BUTTON_STYLES.number} ${colorStyles} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled}`

    return (
      <Button
        key={number}
        variant="ghost"
        size="sm"
        onClick={() => onClick(number)}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {isSelected ? (
          <ChipWithToken
            number={number}
            chipSize={20.45}
            tokenSize={6.82}
            tokenStyles="bottom-[1.7px] right-[1.7px]"
            textStyles="text-[10px]"
          />
        ) : (
          <span>{number}</span>
        )}
      </Button>
    )
  },
)

const BundleButton = React.memo<BundleButtonProps>(
  ({ bundle, label, className, isDisabled, onClick }) => {
    const isRowButton = Object.values(CUSTOM_ROW_BUNDLE).includes(bundle as CUSTOM_ROW_BUNDLE)
    const sizeClass = isRowButton ? BUTTON_STYLES.rowButton : BUTTON_STYLES.regularButton

    const isColorButton = [ROULETTE_INPUT_BUNDLE.RED, ROULETTE_INPUT_BUNDLE.BLACK].includes(
      bundle as ROULETTE_INPUT_BUNDLE,
    )
    const buttonStyles = isColorButton
      ? getColorStyles(bundle === ROULETTE_INPUT_BUNDLE.RED ? "red" : "black")
      : `${getBundleStyles()} roulette-button-border`

    const buttonClasses = `${sizeClass} ${BUTTON_STYLES.bundle} ${buttonStyles} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled} ${className || ""}`

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClick(bundle)}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {label}
      </Button>
    )
  },
)

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

  const getBundleNumbers = (bundle: BundleType): RouletteNumber[] => {
    if (Object.values(CUSTOM_ROW_BUNDLE).includes(bundle as CUSTOM_ROW_BUNDLE)) {
      return CUSTOM_ROW_NUMBERS[bundle as CUSTOM_ROW_BUNDLE]
    }

    switch (bundle as ROULETTE_INPUT_BUNDLE) {
      case ROULETTE_INPUT_BUNDLE.RED:
        return RED_NUMBERS
      case ROULETTE_INPUT_BUNDLE.BLACK:
        return BLACK_NUMBERS
      case ROULETTE_INPUT_BUNDLE.ODD:
        return Array.from({ length: 18 }, (_, i) => (i * 2 + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.EVEN:
        return Array.from({ length: 18 }, (_, i) => ((i + 1) * 2) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN:
        return Array.from({ length: 18 }, (_, i) => (i + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX:
        return Array.from({ length: 18 }, (_, i) => (i + 19) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE:
        return Array.from({ length: 12 }, (_, i) => (i + 1) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR:
        return Array.from({ length: 12 }, (_, i) => (i + 13) as RouletteNumber)
      case ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX:
        return Array.from({ length: 12 }, (_, i) => (i + 25) as RouletteNumber)
      default:
        return []
    }
  }

  const toggleBundleSelection = (bundleNumbers: RouletteNumber[]) => {
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

  const handleBundleClick = (bundle: BundleType) => {
    if (isDisabled) return

    const bundleNumbers = getBundleNumbers(bundle)
    toggleBundleSelection(bundleNumbers)
  }

  return (
    <>
      <GameMultiplierDisplay multiplier={multiplier} className="top-[23px]" />
      <div className="absolute bottom-[8px] left-[9.5px]">
        <div className="w-[285px] h-[156px] space-y-[1px]">
          <div className="flex gap-[1px]">
            <div className="flex flex-col justify-stretch h-[103px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNumberClick(0)}
                disabled={isDisabled}
                className={`relative w-[25px] h-full p-0 text-[12px] leading-5 font-bold rounded-md shadow-none ${getColorStyles(
                  "green",
                )} ${BUTTON_STYLES.common} ${BUTTON_STYLES.disabled}`}
              >
                {isNumberSelected(0) && (
                  <ChipWithToken
                    number={0}
                    chipSize={18}
                    tokenSize={6}
                    tokenStyles="right-[2.5px] bottom-[41px]"
                    textStyles="text-[12px] font-bold"
                  />
                )}
                {!isNumberSelected(0) && <span>0</span>}
              </Button>
            </div>

            <div className="grid grid-rows-4 gap-[1px]">
              {NUMBER_GRID.map((row) => (
                <div key={`row-${row[0]}`} className="grid grid-cols-9 gap-[1px]">
                  {row.map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      isSelected={isNumberSelected(number)}
                      isDisabled={isDisabled}
                      onClick={handleNumberClick}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[1px]">
              <BundleButton
                bundle={CUSTOM_ROW_BUNDLE.ROW_0}
                label="3:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
              <BundleButton
                bundle={CUSTOM_ROW_BUNDLE.ROW_1}
                label="3:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
              <BundleButton
                bundle={CUSTOM_ROW_BUNDLE.ROW_2}
                label="3:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
              <BundleButton
                bundle={CUSTOM_ROW_BUNDLE.ROW_3}
                label="3:1"
                isDisabled={isDisabled}
                onClick={handleBundleClick}
              />
            </div>
          </div>

          <div className="space-y-[1px]">
            <div className="flex gap-[1px]">
              <div className="grid grid-cols-3 gap-[1px] flex-1">
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ONE_TO_TWELVE}
                  label="1 to 12"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.THIRTEEN_TO_TWENTY_FOUR}
                  label="13 to 24"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.TWENTY_FIVE_TO_THIRTY_SIX}
                  label="25 to 36"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
              </div>
            </div>

            <div className="flex gap-[1px]">
              <div className="flex gap-[1px] flex-1">
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ONE_TO_EIGHTEEN}
                  label="1 to 18"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.EVEN}
                  label="Even"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.RED}
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.BLACK}
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.ODD}
                  label="Odd"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
                <BundleButton
                  bundle={ROULETTE_INPUT_BUNDLE.EIGHTEEN_TO_THIRTY_SIX}
                  label="19 to 36"
                  className="flex-1"
                  isDisabled={isDisabled}
                  onClick={handleBundleClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
