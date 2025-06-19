import { KenoBall } from "@betswirl/sdk-core"
import React from "react"
import { Button } from "../ui/button"
import { GameControlsProps } from "./shared/types"

interface KenoGameControlsProps extends GameControlsProps {
  selectedNumbers: KenoBall[]
  onNumbersChange: (numbers: KenoBall[]) => void
  maxSelections: number
}

interface NumberButtonProps {
  number: KenoBall
  isSelected: boolean
  isDisabled: boolean
  onClick: (number: KenoBall) => void
}

interface MultiplierItemProps {
  value: string
  isVisible: boolean
}

const BUTTON_STYLES = {
  unselected: {
    background: "bg-keno-unselected-bg",
    border: "border border-keno-unselected-border border-inset",
    text: "text-black",
    hover: "hover:bg-keno-unselected-hover-bg hover:border-primary hover:text-black",
    focus: "focus:bg-keno-unselected-hover-bg focus:border-primary focus:text-black focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
  },
  selected: {
    background: "bg-primary",
    border: "",
    text: "text-primary-foreground",
    hover: "hover:brightness-105 hover:bg-primary hover:text-primary-foreground",
    focus: "focus:brightness-105 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
  },
  disabled: "disabled:opacity-[0.72]",
  common: "w-[40px] h-[40px] p-0 text-[12px] font-medium rounded-md shadow-none",
} as const

const KENO_NUMBERS_COUNT = 15
const KENO_GRID_COLS = 4
const KENO_GRID_ROWS = 4

const MULTIPLIER_VALUES = [
  "480.48x",
  "9.61x",
  "1.07x",
  "0.40x",
  "0.46x",
  "1.91x",
  "1.02x",
  "0.87x",
]

const NumberButton = React.memo<NumberButtonProps>(
  ({ number, isSelected, isDisabled, onClick }) => {
    const styles = isSelected ? BUTTON_STYLES.selected : BUTTON_STYLES.unselected
    const buttonClasses = `${BUTTON_STYLES.common} ${styles.background} ${styles.border} ${styles.text} ${styles.hover} ${styles.focus} ${BUTTON_STYLES.disabled}`

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClick(number)}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {number}
      </Button>
    )
  },
)

const MultiplierItem = React.memo<MultiplierItemProps>(({ value, isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="w-[48px] h-[15px] flex items-center justify-center text-[10px] font-medium rounded-[4px] bg-keno-multiplier-bg text-white">
      {value}
    </div>
  )
})

export function KenoGameControls({
  selectedNumbers,
  onNumbersChange,
  isDisabled,
  maxSelections,
}: KenoGameControlsProps) {
  const isNumberSelected = (number: KenoBall) => selectedNumbers.includes(number)

  const handleNumberClick = (number: KenoBall) => {
    if (isDisabled) return

    if (isNumberSelected(number)) {
      onNumbersChange(selectedNumbers.filter((n) => n !== number))
    } else if (selectedNumbers.length < maxSelections) {
      onNumbersChange([...selectedNumbers, number])
    }
  }

  const visibleMultipliersCount = selectedNumbers.length > 0 ? selectedNumbers.length + 1 : 0
  const numbers: KenoBall[] = Array.from({ length: KENO_NUMBERS_COUNT }, (_, i) => (i + 1) as KenoBall)

  const renderNumberGrid = () => {
    const rows = []
    for (let row = 0; row < KENO_GRID_ROWS; row++) {
      const rowNumbers = []
      for (let col = 0; col < KENO_GRID_COLS; col++) {
        const numberIndex = row * KENO_GRID_COLS + col
        if (numberIndex >= KENO_NUMBERS_COUNT) break

        const number = numbers[numberIndex]
        rowNumbers.push(
          <NumberButton
            key={number}
            number={number}
            isSelected={isNumberSelected(number)}
            isDisabled={isDisabled}
            onClick={handleNumberClick}
          />
        )
      }
      rows.push(
        <div key={row} className="flex gap-[2px]">
          {rowNumbers}
        </div>
      )
    }
    return rows
  }

  return (
    <div className="absolute top-[16px] bottom-[16px] left-[69px] right-0 flex gap-[13px]">
      <div className="flex flex-col gap-[2px]">
        {renderNumberGrid()}
      </div>

      <div className="flex flex-col gap-[2px] pt-[32px]">
        {MULTIPLIER_VALUES.map((value, index) => (
          <MultiplierItem
            key={index}
            value={value}
            isVisible={index < visibleMultipliersCount}
          />
        ))}
      </div>
    </div>
  )
}
