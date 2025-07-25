import { FORMAT_TYPE, formatRawAmount } from "@betswirl/sdk-core"
import Decimal from "decimal.js"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { parseUnits } from "viem"

import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { TokenIcon } from "../ui/TokenIcon"

interface BetAmountInputProps {
  betAmount: bigint | undefined
  onBetAmountChange: (amount: bigint | undefined) => void
  token: TokenWithImage
  isDisabled: boolean
  onTokenClick: () => void
  formattedBalance: string
}

const BET_AMOUNT_INPUT_STEP = 0.0001

export function BetAmountInput({
  betAmount,
  onBetAmountChange,
  token,
  isDisabled,
  onTokenClick,
  formattedBalance,
}: BetAmountInputProps) {
  const [inputValue, setInputValue] = useState<string>("")
  const [isValidInput, setIsValidInput] = useState<boolean>(true)
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Sync input value with betAmount when user is not typing
  useEffect(() => {
    if (isUserTyping) return

    if (betAmount === undefined) {
      setInputValue("")
      setIsValidInput(true)
    } else {
      const formatted = formatRawAmount(betAmount, token.decimals, FORMAT_TYPE.PRECISE)
      setInputValue(formatted)
      setIsValidInput(true)
    }
  }, [betAmount, token.decimals, isUserTyping])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value

    setInputValue(newInputValue)
    setIsUserTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false)
    }, 1000)

    if (newInputValue === "") {
      onBetAmountChange(undefined)
      setIsValidInput(true)
      return
    }

    try {
      new Decimal(newInputValue)

      try {
        const weiValue = parseUnits(newInputValue, token.decimals)
        onBetAmountChange(weiValue)
        setIsValidInput(true)
      } catch (_error) {
        setIsValidInput(false)
      }
    } catch (_error) {
      setIsValidInput(false)
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
          type="number"
          placeholder="0"
          min={0}
          max={Number.parseFloat(formattedBalance)}
          step={BET_AMOUNT_INPUT_STEP}
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
            !isValidInput && "text-muted-foreground",
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
