import {
  CASINO_GAME_TYPE,
  FORMAT_TYPE,
  GAS_TOKEN_ADDRESS,
  formatRawAmount,
} from "@betswirl/sdk-core"
import Decimal from "decimal.js"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { parseUnits } from "viem"
import { useChain } from "../../context/chainContext"
import { useBetRequirements } from "../../hooks/useBetRequirements"
import { cn } from "../../lib/utils"
import { BetStatus, TokenWithImage } from "../../types"
import { ChainIcon } from "../ui/ChainIcon"
import { TokenIcon } from "../ui/TokenIcon"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface BettingPanelProps {
  game: CASINO_GAME_TYPE
  balance: bigint
  isConnected: boolean
  token: TokenWithImage
  betStatus: BetStatus | null
  betAmount: bigint | undefined
  betCount: number
  grossMultiplier: number // BP
  vrfFees: bigint
  onBetAmountChange: (amount: bigint | undefined) => void
  onPlayBtnClick: () => void
  areChainsSynced: boolean
  isGamePaused: boolean
  needsTokenApproval?: boolean
  isApprovePending?: boolean
  isApproveConfirming?: boolean
  hasValidSelection?: boolean
  isRefetchingAllowance?: boolean
}

const BET_AMOUNT_INPUT_STEP = 0.0001

export function BettingPanel({
  game,
  balance,
  isConnected,
  token,
  betStatus,
  betAmount,
  betCount,
  grossMultiplier,
  vrfFees,
  onBetAmountChange,
  onPlayBtnClick,
  areChainsSynced,
  isGamePaused,
  needsTokenApproval = false,
  isApprovePending = false,
  isApproveConfirming = false,
  hasValidSelection = true,
  isRefetchingAllowance = false,
}: BettingPanelProps) {
  const { appChainId } = useChain()
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
      const formatted = formatRawAmount(betAmount, token.decimals, FORMAT_TYPE.PRECISE)
      setInputValue(formatted)
      setIsValidInput(true)
    }
  }, [betAmount, token.decimals, isUserTyping])

  const {
    isAllowed: isTokenAllowed,
    maxBetAmount,
    formattedMaxBetAmount,
    maxBetCount,
    isLoading: isBetRequirementsLoading,
  } = useBetRequirements({
    game,
    token,
    grossMultiplier,
  })

  const isBetAmountValid = betAmount && betAmount > 0n

  const effectiveBalance = token.address === GAS_TOKEN_ADDRESS ? balance - vrfFees : balance
  const isTotalbetAmountExceedsBalance =
    betAmount && BigInt(betCount) * betAmount > effectiveBalance
  const isBetCountValid = betCount > 0 && betCount <= maxBetCount
  const isBetAmountExceedsMaxBetAmount = betAmount && betAmount > maxBetAmount

  const formattedBalance = formatRawAmount(balance, token.decimals)

  const isBetSuccees = betStatus === "success"
  const isWaiting = betStatus === "loading" || betStatus === "pending" || betStatus === "rolling"
  const isError =
    betStatus === "error" || betStatus === "waiting-error" || betStatus === "internal-error"

  const canInitiateBet =
    isConnected &&
    areChainsSynced &&
    isBetAmountValid &&
    !isTotalbetAmountExceedsBalance &&
    !isWaiting &&
    !isGamePaused &&
    !isBetRequirementsLoading &&
    isTokenAllowed &&
    isBetCountValid &&
    !isBetAmountExceedsMaxBetAmount &&
    hasValidSelection

  const isApprovingToken = isApprovePending || isApproveConfirming
  const isInputDisabled = !isConnected || isWaiting || isBetSuccees || isApprovingToken

  const isPlayButtonDisabled: boolean =
    isWaiting || (!canInitiateBet && !needsTokenApproval) || isApprovingToken

  let playButtonText: string
  if (isApprovePending) {
    playButtonText = "Sign Approval..."
  } else if (isApproveConfirming || isRefetchingAllowance) {
    playButtonText = "Confirming Approval..."
  } else if (needsTokenApproval) {
    playButtonText = "Approve Token"
  } else if (isError) {
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
  } else if (isGamePaused) {
    playButtonText = "Game paused"
  } else if (!hasValidSelection) {
    playButtonText = "Make your selection"
  } else if (isBetRequirementsLoading) {
    playButtonText = "Loading..."
  } else if (!isTokenAllowed) {
    playButtonText = "Token not allowed"
  } else if (isTotalbetAmountExceedsBalance) {
    playButtonText = "Insufficient balance"
  } else if (!isBetCountValid) {
    playButtonText = `Max bet count exceeded (${maxBetCount})`
  } else if (isBetAmountExceedsMaxBetAmount) {
    playButtonText = `Max bet amount exceeded (${formattedMaxBetAmount})`
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
      const maxBalance = token.address === GAS_TOKEN_ADDRESS ? balance - vrfFees : balance

      const maxBetAmount = maxBalance > 0n ? maxBalance : 0n
      onBetAmountChange(maxBetAmount)
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
          <div className="flex items-center ml-1">
            <ChainIcon chainId={appChainId} size={18} className="-mr-[4px] mask-overlap-cutout" />
            <TokenIcon token={token} size={18} />
          </div>
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
          className={cn("relative", !isValidInput && "[&_input]:text-muted-foreground")}
          token={{
            icon: <TokenIcon token={token} size={18} className="mr-1" />,
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
        className={cn("w-full", "border-0", "font-bold", "rounded-[16px]", "text-play-btn-font")}
        variant={isError ? "destructive" : "default"}
        onClick={handlePlayBtnClick}
        disabled={isPlayButtonDisabled}
      >
        {playButtonText}
      </Button>
    </div>
  )
}
