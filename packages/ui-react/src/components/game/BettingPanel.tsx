import { CASINO_GAME_TYPE, formatRawAmount, GAS_TOKEN_ADDRESS } from "@betswirl/sdk-core"
import { WalletModal } from "@coinbase/onchainkit/wallet"
import { useEffect, useRef, useState } from "react"
import { useChain } from "../../context/chainContext"
import { useBetRequirements } from "../../hooks/useBetRequirements"
import { cn, getTokenImage } from "../../lib/utils"
import { BetStatus, ChainTokenPanelView, TokenWithImage } from "../../types/types"

export interface FreeBet {
  id: string
  amount: number
  token: TokenWithImage
  expiresAt?: string
}

import { Hex } from "viem"
import { Button } from "../ui/button"
import { ChainIcon } from "../ui/ChainIcon"
import { Sheet } from "../ui/sheet"
import { TokenIcon } from "../ui/TokenIcon"
import { BetAmountInput } from "./BetAmountInput"
import { ChainAndTokenSheetPanel } from "./ChainAndTokenSheetPanel"
import { FreeBetInput } from "./FreeBetInput"
import { FreeBetSheetPanel } from "./FreeBetSheetPanel"

interface BettingPanelProps {
  game: CASINO_GAME_TYPE
  balance: bigint
  isConnected: boolean
  isWalletConnecting: boolean
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
  approveError?: any
  portalContainer: HTMLElement | null
  isMounted: boolean
}

// Mock FreeBet data
const mockFreeBets: FreeBet[] = [
  {
    id: "1",
    amount: 4,
    token: {
      address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
      symbol: "DEGEN",
      decimals: 18,
      image: getTokenImage("DEGEN"),
    },
  },
  {
    id: "2",
    amount: 3,
    token: {
      address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
      symbol: "DEGEN",
      decimals: 18,
      image: getTokenImage("DEGEN"),
    },
    expiresAt: "10/12/2025, 12:27:00 PM GTM+3",
  },
  {
    id: "3",
    amount: 2,
    token: {
      address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
      symbol: "DEGEN",
      decimals: 18,
      image: getTokenImage("DEGEN"),
    },
  },
  {
    id: "4",
    amount: 1,
    token: {
      address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
      symbol: "DEGEN",
      decimals: 18,
      image: getTokenImage("DEGEN"),
    },
  },
]

export function BettingPanel({
  game,
  balance,
  isConnected,
  isWalletConnecting,
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
  approveError,
  portalContainer,
  isMounted,
}: BettingPanelProps) {
  const { appChainId, switchWalletChain } = useChain()
  const [isChainTokenSheetOpen, setIsChainTokenSheetOpen] = useState<boolean>(false)
  const [panelInitialView, setPanelInitialView] = useState<ChainTokenPanelView>("main")
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isFreeBetSheetOpen, setIsFreeBetSheetOpen] = useState(false)
  const [selectedFreeBet, setSelectedFreeBet] = useState<FreeBet | null>(mockFreeBets[0]) // Default to first freebet

  // Track previous values to detect actual changes
  const prevChainIdRef = useRef(appChainId)
  const prevTokenAddressRef = useRef(token.address)

  // Clear bet amount when chain or token actually changes
  useEffect(() => {
    const chainChanged = prevChainIdRef.current !== appChainId
    const tokenChanged = prevTokenAddressRef.current !== token.address

    if (chainChanged || tokenChanged) {
      onBetAmountChange(undefined)
    }

    prevChainIdRef.current = appChainId
    prevTokenAddressRef.current = token.address
  }, [appChainId, token.address, onBetAmountChange]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const isBetSuccess = betStatus === "success"
  const isWaiting = betStatus === "loading" || betStatus === "pending" || betStatus === "rolling"
  const isError =
    betStatus === "error" ||
    betStatus === "waiting-error" ||
    betStatus === "internal-error" ||
    !!approveError

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
  const isInputDisabled = !isConnected || isWaiting || isBetSuccess || isApprovingToken
  const isChainSwitchingDisabled = isWaiting || isBetSuccess || isApprovingToken

  const isPlayButtonDisabled: boolean =
    isWalletConnecting ||
    isWaiting ||
    (!canInitiateBet && !needsTokenApproval && areChainsSynced) ||
    isApprovingToken

  let playButtonText: string
  if (isApprovePending) {
    playButtonText = "Sign Approval..."
  } else if (isApproveConfirming || isRefetchingAllowance) {
    playButtonText = "Confirming Approval..."
  } else if (needsTokenApproval) {
    playButtonText = "Approve Token"
  } else if (isError) {
    playButtonText = "Error, try again"
  } else if (isBetSuccess) {
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
    if (!isConnected) {
      setIsWalletModalOpen(true)
      return
    }
    // Handle chain switching when chains are not synced
    if (!areChainsSynced && isConnected) {
      switchWalletChain(appChainId)
      return
    }
    onPlayBtnClick()
  }

  const openSheetPanel = (view: ChainTokenPanelView) => {
    setPanelInitialView(view)
    setIsChainTokenSheetOpen(true)
  }

  const handleSheetClose = () => {
    setIsChainTokenSheetOpen(false)
    setPanelInitialView("main")
  }

  const handleBalanceClick = () => openSheetPanel("main")
  const handleTokenClick = () => openSheetPanel("token")

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

  const handleFreeBetSelect = (freeBet: FreeBet) => {
    setSelectedFreeBet(freeBet)
    setIsFreeBetSheetOpen(false)
  }

  const handleRemoveFreeBet = () => {
    setSelectedFreeBet(null)
  }

  const handleFreeBetClick = () => {
    setIsFreeBetSheetOpen(true)
  }

  return (
    <div className="bg-control-panel-background p-4 rounded-[16px] flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium flex items-center">
          <span className="text-text-on-surface-variant">Balance:&nbsp;</span>
          <Button
            variant="ghost"
            onClick={handleBalanceClick}
            disabled={isChainSwitchingDisabled}
            className={cn(
              "text-sm font-medium flex items-center w-fit h-auto p-0",
              "bg-secondary rounded-[8px] px-2 py-1",
              "hover:opacity-80 hover:bg-secondary transition-opacity",
            )}
          >
            <span className="font-semibold">{formattedBalance}</span>
            <div className="flex items-center ml-1">
              <ChainIcon chainId={appChainId} size={18} className="-mr-[4px] mask-overlap-cutout" />
              <TokenIcon token={token} size={18} />
            </div>
          </Button>
        </div>

        {selectedFreeBet ? (
          <FreeBetInput
            amount={selectedFreeBet.amount}
            token={selectedFreeBet.token}
            isDisabled={isInputDisabled}
            onClick={handleFreeBetClick}
            onRemoveFreebet={handleRemoveFreeBet}
          />
        ) : (
          <BetAmountInput
            betAmount={betAmount}
            onBetAmountChange={onBetAmountChange}
            token={token}
            isDisabled={isInputDisabled}
            onTokenClick={handleTokenClick}
            formattedBalance={formattedBalance}
          />
        )}

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
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false)
        }}
      />
      <Button
        size="lg"
        className={cn("w-full", "border-0", "font-bold", "rounded-[16px]", "text-play-btn-font")}
        variant={isError ? "destructive" : "default"}
        onClick={handlePlayBtnClick}
        disabled={isPlayButtonDisabled}
      >
        {playButtonText}
      </Button>
      <Sheet
        open={isChainTokenSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleSheetClose()
          }
        }}
      >
        {isMounted && portalContainer && (
          <ChainAndTokenSheetPanel
            portalContainer={portalContainer}
            initialView={panelInitialView}
          />
        )}
      </Sheet>
      <Sheet
        open={isFreeBetSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFreeBetSheetOpen(false)
          }
        }}
      >
        {isMounted && portalContainer && (
          <FreeBetSheetPanel
            portalContainer={portalContainer}
            freeBets={mockFreeBets}
            selectedFreeBet={selectedFreeBet}
            onSelect={handleFreeBetSelect}
          />
        )}
      </Sheet>
    </div>
  )
}
