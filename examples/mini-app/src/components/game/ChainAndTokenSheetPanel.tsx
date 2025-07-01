import {
  type CasinoChainId,
  FORMAT_TYPE,
  chainById,
  chainNativeCurrencyToToken,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { type Hex, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useTokens } from "../../hooks/useTokens"
import { cn } from "../../lib/utils"
import { ChainTokenPanelView, TokenWithImage } from "../../types/types"
import { ChainIcon } from "../ui/ChainIcon"
import { TokenIcon } from "../ui/TokenIcon"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"

interface ChainAndTokenSheetPanelProps {
  portalContainer: HTMLElement
  initialView?: ChainTokenPanelView
}

export function ChainAndTokenSheetPanel({
  portalContainer,
  initialView = "main",
}: ChainAndTokenSheetPanelProps) {
  const { appChain, appChainId, switchAppChain } = useChain()
  const { selectedToken, setSelectedToken } = useTokenContext()
  const [currentView, setCurrentView] = useState<ChainTokenPanelView>(initialView)
  const { address } = useAccount()
  const { tokens, loading: tokensLoading } = useTokens({
    onlyActive: true,
  })

  useEffect(() => {
    setCurrentView(initialView)
  }, [initialView])

  const effectiveToken: TokenWithImage = selectedToken || {
    ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
    image: "",
  }

  const handleTokenSelect = (token: TokenWithImage) => {
    setSelectedToken(token)
    setCurrentView("main")
  }

  const handleChainSelect = (chainId: CasinoChainId) => {
    switchAppChain(chainId)
    setCurrentView("main")
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-auto !max-h-[70%]", "p-5 sm:p-6")}>
        {currentView === "main" && (
          <div className="flex flex-col gap-6">
            {/* Current chain section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text-on-surface-variant">Current chain</p>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("chain")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
                  "bg-surface-selected border-0",
                  "text-foreground font-medium",
                  "hover:bg-token-hovered-bg transition-colors",
                )}
              >
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={appChainId} size={20} />
                  <span>{appChain.viemChain.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>

            {/* Balance used section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text-on-surface-variant">Balance used</p>
              <Button
                variant="ghost"
                onClick={() => setCurrentView("token")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[8px] h-auto",
                  "bg-surface-selected border-0",
                  "text-foreground font-medium",
                  "hover:bg-token-hovered-bg transition-colors",
                )}
              >
                <div className="flex items-center gap-2">
                  <TokenIcon token={effectiveToken} size={20} />
                  <span>{effectiveToken.symbol}</span>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        )}

        {currentView === "chain" && (
          <ChainSelectionView
            currentChainId={appChainId}
            onChainSelect={handleChainSelect}
            onBack={() => setCurrentView("main")}
          />
        )}

        {currentView === "token" && (
          <TokenSelectionView
            tokens={tokens}
            tokensLoading={tokensLoading}
            selectedToken={effectiveToken}
            onTokenSelect={handleTokenSelect}
            onBack={() => setCurrentView("main")}
            userAddress={address}
          />
        )}
      </SheetBottomPanelContent>
    </SheetPortal>
  )
}

interface ChainSelectionViewProps {
  currentChainId: CasinoChainId
  onChainSelect: (chainId: CasinoChainId) => void
  onBack: () => void
}

function ChainSelectionView({ currentChainId, onChainSelect, onBack }: ChainSelectionViewProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-[8px] hover:bg-surface-hover transition-colors p-0"
        >
          <ChevronDown className="h-4 w-4 !rotate-90" />
        </Button>
        <h2 className="text-lg font-semibold">Select Chain</h2>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          onClick={() => onChainSelect(currentChainId)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-[8px] w-full text-left h-auto justify-start",
            "bg-surface-selected hover:bg-surface-hover transition-colors",
          )}
        >
          <ChainIcon chainId={currentChainId} size={24} />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">Current Chain</span>
            <span className="text-sm text-muted-foreground">Only current chain is available</span>
          </div>
        </Button>
      </div>
    </div>
  )
}

interface TokenSelectionViewProps {
  tokens: TokenWithImage[]
  tokensLoading: boolean
  selectedToken: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
  onBack: () => void
  userAddress?: string
}

function TokenSelectionView({
  tokens,
  tokensLoading,
  selectedToken,
  onTokenSelect,
  onBack,
  userAddress,
}: TokenSelectionViewProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-[8px] hover:bg-surface-hover transition-colors p-0"
        >
          <ChevronDown className="h-4 w-4 !rotate-90" />
        </Button>
        <h2 className="text-lg font-semibold">Select Token</h2>
      </div>

      <ScrollArea className="h-60">
        <div className="flex flex-col gap-2 pr-4">
          {tokensLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading tokens...
            </div>
          ) : tokens.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tokens available
            </div>
          ) : (
            tokens.map((token) => (
              <Button
                variant="ghost"
                key={token.address}
                onClick={() => onTokenSelect(token)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-[8px] w-full text-left h-auto",
                  "hover:bg-surface-hover transition-colors",
                  token.address === selectedToken.address && "bg-surface-selected",
                )}
              >
                <div className="flex items-center gap-3">
                  <TokenIcon token={token} size={24} />
                  <span className="font-medium text-foreground">{token.symbol}</span>
                </div>
                <TokenBalance token={token} userAddress={userAddress} />
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface TokenBalanceProps {
  token: TokenWithImage
  userAddress?: string
}

function TokenBalance({ token, userAddress }: TokenBalanceProps) {
  const { data: balance } = useBalance({
    address: userAddress as Hex,
    token: token.address === zeroAddress ? undefined : (token.address as Hex),
  })

  const formattedBalance = balance
    ? formatRawAmount(balance.value, token.decimals, FORMAT_TYPE.PRECISE)
    : "0"

  return <span className="text-sm text-muted-foreground">{formattedBalance}</span>
}
