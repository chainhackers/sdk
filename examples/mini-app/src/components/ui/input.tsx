import * as React from "react"

import { cn } from "../../lib/utils"
import { TokenChip } from "@coinbase/onchainkit/token"
import {Token} from "@coinbase/onchainkit/src/token/types.ts";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  token?: Token
}
// TODO consider using an existing component like
// https://docs.base.org/builderkits/onchainkit/buy/buy
// https://docs.base.org/builderkits/onchainkit/fund/fund-card
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, token, ...props }, ref) => {
    const hasTokenInfo = token && (token.icon || token.symbol)

    return (
      <div className={cn("relative flex h-12 w-full items-center", className)}>
        <input
          type={type}
          data-slot="input"
          className={cn(
            "flex h-full w-full rounded-[12px] border-0",
            "bg-neutral-background text-foreground font-semibold",
            "px-4 py-2",
            hasTokenInfo ? "pr-16 md:pr-20" : "",
            "text-base placeholder:text-muted-foreground",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          ref={ref}
          {...props}
        />
        {hasTokenInfo && (
          <div className="absolute right-0 top-1/2 mr-3 flex -translate-y-1/2 transform items-center gap-1 text-sm text-foreground pointer-events-none font-semibold">
              <TokenChip token={token} />
          </div>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
