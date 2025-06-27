import { formatRawAmount, FORMAT_TYPE } from "@betswirl/sdk-core"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useBalance, useAccount } from "wagmi"
import { zeroAddress, type Hex } from "viem"
import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { useTokens } from "../../hooks/useTokens"
import { useChain } from "../../context/chainContext"
import { TokenIcon } from "../ui/TokenIcon"
import { ChainIcon } from "../ui/ChainIcon"
import { SheetBottomPanelContent, SheetOverlay, SheetPortal } from "../ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface ChainAndTokenSheetPanelProps {
  portalContainer: HTMLElement
  selectedToken: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
}

export function ChainAndTokenSheetPanel({
  portalContainer,
  selectedToken,
  onTokenSelect,
}: ChainAndTokenSheetPanelProps) {
  const { appChain, appChainId } = useChain()
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)
  const { address } = useAccount()
  const { tokens, loading: tokensLoading } = useTokens({
    onlyActive: true,
  })

  const handleTokenSelect = (token: TokenWithImage) => {
    onTokenSelect(token)
    setIsTokenDropdownOpen(false)
  }

  return (
    <SheetPortal container={portalContainer}>
      <SheetOverlay className="!absolute !inset-0 !bg-black/60" />
      <SheetBottomPanelContent className={cn("!h-auto !max-h-[70%]", "p-5 sm:p-6")}>
        <div className="flex flex-col gap-6">
          {/* Current chain section */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-text-on-surface-variant">Current chain</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={true}
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-[12px]",
                    "bg-neutral-background border-0",
                    "text-foreground font-medium",
                    "cursor-not-allowed opacity-75"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ChainIcon chainId={appChainId} size={20} />
                    <span>{appChain.viemChain.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>

          {/* Balance used section */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-text-on-surface-variant">Balance used</p>
            <DropdownMenu open={isTokenDropdownOpen} onOpenChange={setIsTokenDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-[12px]",
                    "bg-neutral-background border-0",
                    "text-foreground font-medium",
                    "hover:opacity-80 transition-opacity"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TokenIcon token={selectedToken} size={20} />
                    <span>{selectedToken.symbol}</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isTokenDropdownOpen && "rotate-180"
                  )} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto"
                align="start"
                sideOffset={4}
              >
                {tokensLoading ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    Loading tokens...
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No tokens available
                  </div>
                ) : (
                  tokens.map((token) => (
                    <DropdownMenuItem
                      key={token.address}
                      onClick={() => handleTokenSelect(token)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 cursor-pointer",
                        token.address === selectedToken.address && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <TokenIcon token={token} size={20} />
                        <span className="font-medium text-foreground">{token.symbol}</span>
                      </div>
                      <TokenBalance token={token} userAddress={address} />
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SheetBottomPanelContent>
    </SheetPortal>
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

  return (
    <span className="text-sm text-muted-foreground">{formattedBalance}</span>
  )
}
