import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"
import { cn } from "../../lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const initialValues = React.useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return [min]
  }, [value, defaultValue, min])

  const [internalValues, setInternalValues] =
    React.useState<number[]>(initialValues)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const handleValueChange = (newValues: number[]) => {
    setInternalValues(newValues)
    onValueChange?.(newValues)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        inverted={true}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            )}
          />
        </SliderPrimitive.Track>
        {internalValues.map((currentValue, index) => (
          <Tooltip key={index} open={isDragging || isFocused}>
            <TooltipTrigger asChild>
              <SliderPrimitive.Thumb
                data-slot="slider-thumb"
                className={cn(
                  "block size-[14px] rounded-full bg-primary transition-all duration-200 ease-in-out hover:bg-violet3 hover:shadow-[0_0_0_14px] hover:shadow-primary/20 focus:shadow-[0_0_0_14px] focus:shadow-primary/20 focus:outline-none z-10 cursor-pointer",
                )}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-[#E5E7EB]/80">
              <p>{Math.round(currentValue)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </SliderPrimitive.Root>
    </TooltipProvider>
  )
}

export { Slider }
