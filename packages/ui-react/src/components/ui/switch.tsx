import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "../../lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-[18px] w-[18px] rounded-full bg-menu-bg shadow-sm ring-0 transition-transform",
          "data-[state=unchecked]:translate-x-[1px]",
          "data-[state=checked]:translate-x-[16px]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
