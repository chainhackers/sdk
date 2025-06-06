import { FORMAT_TYPE, formatRawAmount, Token } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import Decimal from "decimal.js"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { parseUnits } from "viem"
import { ETH_TOKEN } from "../../lib/tokens"
import { cn } from "../../lib/utils"
import { BetStatus } from "../../types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface BettingPanelProps {
  balance: bigint
  isConnected: boolean
  token: Token
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  onBetAmountChange: (amount: bigint | undefined) => void
  onPlayBtnClick: () => void
  areChainsSynced: boolean
}

const BET_AMOUNT_INPUT_STEP = 0.0001

export function BettingPanel({
  balance,
  isConnected,
  token,
  betStatus,
  betAmount,
  onBetAmountChange,
  onPlayBtnClick,
  areChainsSynced,
}: BettingPanelProps) {
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

  useEffect(() => {
    if (isUserTyping) return

    if (betAmount === undefined) {
      setInputValue("")
      setIsValidInput(true)
    } else {
      const formatted = formatRawAmount(
        betAmount,
        token.decimals,
        FORMAT_TYPE.PRECISE,
      )
      setInputValue(formatted)
      setIsValidInput(true)
    }
  }, [betAmount, token.decimals, isUserTyping])

  const isBetAmountValid = betAmount && betAmount > 0n
  const isBetAmountExceedsBalance = betAmount && betAmount > balance
  const formattedBalance = formatRawAmount(balance, token.decimals)

  const isBetSuccees = betStatus === "success"
  const isWaiting =
    betStatus === "loading" ||
    betStatus === "pending" ||
    betStatus === "rolling"
  const isError =
    betStatus === "error" ||
    betStatus === "waiting-error" ||
    betStatus === "internal-error"

  const canInitiateBet =
    isConnected &&
    areChainsSynced &&
    isBetAmountValid &&
    !isBetAmountExceedsBalance &&
    !isWaiting

  const isInputDisabled = !isConnected || isWaiting || isBetSuccees

  const isPlayButtonDisabled: boolean = isWaiting || !canInitiateBet

  let playButtonText: string
  if (isError) {
    playButtonText = "Error, try again"
  } else if (isBetSuccees) {
    playButtonText = "Try again"
  } else if (betStatus === "pending") {
    playButtonText = "Placing Bet..."
  } else if (betStatus === "loading") {
    playButtonText = "Loading Bet..."
  } else if (betStatus === "rolling") {
    playButtonText = "Bet rolling..."
  } else if (!isConnected) {
    playButtonText = "Connect Wallet"
  } else if (!areChainsSynced) {
    playButtonText = "Switch chain"
  } else if (isBetAmountExceedsBalance) {
    playButtonText = "Insufficient balance"
  } else {
    playButtonText = "Place Bet"
  }

  const handlePlayBtnClick = () => {
    onPlayBtnClick()
  }

  const handleHalfBet = () => {
    const currentAmount = betAmount ?? 0n
    if (currentAmount > 0n) {
      const halfAmount = currentAmount / 2n
      onBetAmountChange(halfAmount)
    }
  }

  const handleDoubleBet = () => {
    const currentAmount = betAmount ?? 0n
    const doubledAmount = currentAmount * 2n
    if (isConnected) {
      const maxAmount = balance
      const finalAmount = doubledAmount > maxAmount ? maxAmount : doubledAmount
      onBetAmountChange(finalAmount)
    } else {
      onBetAmountChange(doubledAmount)
    }
  }

  const handleMaxBet = () => {
    if (isConnected) {
      onBetAmountChange(balance)
    }
  }

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
      } catch {
        setIsValidInput(false)
      }
    } catch {
      setIsValidInput(false)
    }
  }

  return (
    <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium flex items-center">
          <span className="text-text-on-surface-variant">Balance:&nbsp;</span>
          <span className="font-semibold">{formattedBalance}</span>
          <TokenImage token={ETH_TOKEN} size={18} className="ml-1" />
        </div>

        <Label
          htmlFor="betAmount"
          className="text-sm font-medium -mb-1 text-text-on-surface-variant"
        >
          Bet amount
        </Label>
        <Input
          id="betAmount"
          type="number"
          placeholder="0"
          min={0}
          max={Number.parseFloat(formattedBalance)}
          step={BET_AMOUNT_INPUT_STEP}
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            "relative",
            !isValidInput && "[&_input]:text-muted-foreground",
          )}
          token={{
            icon: <TokenImage token={ETH_TOKEN} size={18} />,
            symbol: token.symbol,
          }}
          disabled={isInputDisabled}
        />

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={handleHalfBet}
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            disabled={isInputDisabled || !isBetAmountValid}
          >
            1/2
          </Button>
          <Button
            variant="secondary"
            onClick={handleDoubleBet}
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            disabled={isInputDisabled || !isBetAmountValid}
          >
            2x
          </Button>
          <Button
            variant="secondary"
            className="border border-border-stroke rounded-[8px] h-[30px] w-[85.33px] text-text-on-surface"
            onClick={handleMaxBet}
            disabled={isInputDisabled || !isBetAmountValid}
          >
            Max
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        className={cn(
          "w-full",
          "border-0",
          "font-bold",
          "rounded-[16px]",
          "text-play-btn-font",
        )}
        variant={isError ? "destructive" : "default"}
        onClick={handlePlayBtnClick}
        disabled={isPlayButtonDisabled}
      >
        {playButtonText}
      </Button>
    </div>
  )
}
