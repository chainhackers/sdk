import { FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import { ChangeEvent, useEffect, useState } from "react"
import { parseUnits } from "viem"

import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { TokenIcon } from "../ui/TokenIcon"

interface BetAmountInputProps {
  betAmount: bigint | undefined
  onBetAmountChange: (amount: bigint | undefined) => void
  onValidityChange: (isValid: boolean) => void
  token: TokenWithImage
  isDisabled: boolean
  onTokenClick: () => void
  formattedBalance: string
}

export function BetAmountInput({
  betAmount,
  onBetAmountChange,
  onValidityChange,
  token,
  isDisabled,
  onTokenClick,
}: BetAmountInputProps) {
  const [inputValue, setInputValue] = useState<string>("")
  const [lastParsedValue, setLastParsedValue] = useState<bigint | undefined>(undefined)

  useEffect(() => {
    if (betAmount !== lastParsedValue) {
      if (betAmount === undefined) {
        setInputValue("")
      } else {
        const formatted = formatRawAmount(betAmount, token.decimals, FORMAT_TYPE.FULL_PRECISE)
        setInputValue(formatted)
      }
      setLastParsedValue(betAmount)
    }
  }, [betAmount, token.decimals, lastParsedValue])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value
    setInputValue(newInputValue)

    if (newInputValue === "") {
      const newValue = undefined
      setLastParsedValue(newValue)
      onBetAmountChange(newValue)
      onValidityChange(true)
      return
    }

    try {
      const weiValue = parseUnits(newInputValue, token.decimals)
      setLastParsedValue(weiValue)
      onBetAmountChange(weiValue)
      onValidityChange(true)
    } catch (_error) {
      onBetAmountChange(undefined)
      onValidityChange(false)
    }
  }

  return (
    <>
      <Label htmlFor="betAmount" className="text-sm font-medium -mb-1 text-text-on-surface-variant">
        Bet amount
      </Label>
      <div className="relative flex h-12 w-full items-center text-sm">
        <input
          id="betAmount"
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isDisabled}
          className={cn(
            "flex h-full w-full rounded-[12px] border-0",
            "bg-neutral-background text-foreground font-semibold",
            "px-4 py-2 pr-16",
            "text-base placeholder:text-muted-foreground",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <Button
          variant="ghost"
          onClick={onTokenClick}
          className={cn(
            "absolute right-[12px] top-1/2 -translate-y-1/2 transform",
            "flex items-center text-foreground font-medium gap-1",
            "h-auto w-fit p-0 bg-transparent hover:bg-transparent hover:opacity-80 transition-opacity",
            "border-0 shadow-none outline-none focus:outline-none",
          )}
          disabled={isDisabled}
        >
          <TokenIcon token={token} size={18} />
          <span>{token.symbol}</span>
        </Button>
      </div>
    </>
  )
}
