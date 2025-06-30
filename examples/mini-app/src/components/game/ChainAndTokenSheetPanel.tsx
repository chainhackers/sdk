import {
  type CasinoChainId,
  FORMAT_TYPE,
  chainById,
  chainNativeCurrencyToToken,
  formatRawAmount,
} from "@betswirl/sdk-core"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { type Hex, zeroAddress } from "viem"
import { useAccount, useBalance } from "wagmi"
import { useChain } from "../../context/chainContext"
import { useTokenContext } from "../../context/tokenContext"
import { useTokens } from "../../hooks/useTokens"
import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { ChainIcon } from "../ui/ChainIcon"
import { TokenIcon } from "../ui/TokenIcon"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"

type ActiveView = "main" | "chain" | "token"

interface ChainAndTokenSheetPanelProps {
  portalContainer: HTMLElement
}

export function ChainAndTokenSheetPanel({ portalContainer }: ChainAndTokenSheetPanelProps) {
  const { appChain, appChainId, switchAppChain } = useChain()
  const { selectedToken, setSelectedToken } = useTokenContext()
  const [activeView, setActiveView] = useState<ActiveView>("main")
  const { address } = useAccount()
  const { tokens, loading: tokensLoading } = useTokens({
    onlyActive: true,
  })

  // Determine the effective token to use
  const effectiveToken: TokenWithImage = selectedToken || {
    ...chainNativeCurrencyToToken(chainById[appChainId].nativeCurrency),
    image: "", // Fallback for native currency - user should configure this
  }

  const handleTokenSelect = (token: TokenWithImage) => {
    setSelectedToken(token)
    setActiveView("main")
  }

  const handleChainSelect = (chainId: CasinoChainId) => {
    switchAppChain(chainId)
    setActiveView("main")
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-auto !max-h-[70%]", "p-5 sm:p-6")}>
        {activeView === "main" && (
          <div className="flex flex-col gap-6">
            {/* Current chain section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-text-on-surface-variant">Current chain</p>
              <Button
                variant="ghost"
                onClick={() => setActiveView("chain")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[12px] h-auto",
                  "bg-neutral-background border-0",
                  "text-foreground font-medium",
                  "hover:opacity-80 hover:bg-neutral-background transition-opacity",
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
                onClick={() => setActiveView("token")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-[12px] h-auto",
                  "bg-neutral-background border-0",
                  "text-foreground font-medium",
                  "hover:opacity-80 hover:bg-neutral-background transition-opacity",
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

        {activeView === "chain" && (
          <ChainSelectionView
            currentChainId={appChainId}
            onChainSelect={handleChainSelect}
            onBack={() => setActiveView("main")}
          />
        )}

        {activeView === "token" && (
          <TokenSelectionView
            tokens={tokens}
            tokensLoading={tokensLoading}
            selectedToken={effectiveToken}
            onTokenSelect={handleTokenSelect}
            onBack={() => setActiveView("main")}
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
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors p-0"
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
            "flex items-center gap-3 p-3 rounded-[12px] w-full text-left h-auto justify-start",
            "bg-neutral-background hover:opacity-80 hover:bg-neutral-background transition-opacity",
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
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors p-0"
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
                  "flex items-center justify-between p-3 rounded-[12px] w-full text-left h-auto",
                  "hover:bg-muted transition-colors",
                  token.address === selectedToken.address && "bg-muted",
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
