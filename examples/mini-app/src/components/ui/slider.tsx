import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"
import { cn } from "../../lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const SLIDER_EDGE_THRESHOLD_LOW = 5
const SLIDER_EDGE_THRESHOLD_HIGH = 95
const SLIDER_EDGE_ADJUSTMENT_FACTOR = 0.3

function getAdjustedPercentage(
  value: number,
  min: number,
  max: number,
): number {
  const basePercentage = ((value - min) / (max - min)) * 100

  if (basePercentage <= SLIDER_EDGE_THRESHOLD_LOW) {
    return (
      basePercentage +
      (SLIDER_EDGE_THRESHOLD_LOW - basePercentage) *
        SLIDER_EDGE_ADJUSTMENT_FACTOR
    )
  }
  if (basePercentage >= SLIDER_EDGE_THRESHOLD_HIGH) {
    return (
      basePercentage -
      (basePercentage - SLIDER_EDGE_THRESHOLD_HIGH) *
        SLIDER_EDGE_ADJUSTMENT_FACTOR
    )
  }
  return basePercentage
}

interface SliderProps {
  className?: string
  defaultValue?: number[]
  value?: number[]
  min?: number
  max?: number
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  step?: number
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  disabled,
  step,
  ...props
}: SliderProps) {
  const getInitialValues = (): number[] => {
    if (value !== undefined) {
      return value
    }
    if (defaultValue !== undefined) {
      return defaultValue
    }
    return [min]
  }

  const [internalValues, setInternalValues] =
    React.useState<number[]>(getInitialValues)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    if (value !== undefined) {
      if (
        value.length !== internalValues.length ||
        value.some((v, i) => v !== internalValues[i])
      ) {
        setInternalValues(value)
      }
    }
  }, [value, internalValues])

  const handleValueChange = (newValues: number[]) => {
    if (value === undefined) {
      setInternalValues(newValues)
    }
    onValueChange?.(newValues)
  }

  const currentTrackValue = internalValues[0] ?? min
  const percentage = getAdjustedPercentage(currentTrackValue, min, max)

  return (
    <TooltipProvider delayDuration={0}>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col cursor-pointer",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-[#090C15]/10 relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          )}
        >
          <div
            className={cn(
              "absolute h-full right-0",
              disabled ? "bg-slider-disabled" : "bg-primary",
            )}
            style={{
              width: `${100 - percentage}%`,
            }}
          />
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="opacity-0 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {internalValues.map((currentSliderValue, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Slider thumbs are positionally keyed; arity fixed post-mount.
          <Tooltip key={index} open={isDragging || isFocused}>
            <TooltipTrigger asChild>
              <SliderPrimitive.Thumb
                data-slot="slider-thumb"
                className={cn(
                  "block size-[14px] rounded-full transition-all duration-200 ease-in-out focus:outline-none z-10",
                  disabled
                    ? "bg-slider-disabled hover:shadow-[0_0_0_7px] hover:shadow-slider-disabled-shadow focus:shadow-[0_0_0_7px] focus:shadow-slider-disabled-shadow"
                    : "bg-primary hover:bg-violet3 hover:shadow-[0_0_0_7px] hover:shadow-primary/20 focus:shadow-[0_0_0_7px] focus:shadow-primary/20",
                )}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-muted/80">
              <p className={cn(disabled ? "text-slider-disabled-tooltip" : "")}>
                {Math.round(currentSliderValue)}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </SliderPrimitive.Root>
    </TooltipProvider>
  )
}

export { Slider }
