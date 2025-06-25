import { formatRawAmount, FORMAT_TYPE } from "@betswirl/sdk-core"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useBalance, useAccount } from "wagmi"
import { zeroAddress, type Hex } from "viem"
import { cn } from "../../lib/utils"
import { TokenWithImage } from "../../types/types"
import { useTokens } from "../../hooks/useTokens"
import { TokenIcon } from "./TokenIcon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface TokenAmountInputProps {
  value: string
  onChange: (value: string) => void
  selectedToken: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
  filteredTokens?: TokenWithImage[]
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  step?: number
}

export function TokenAmountInput({
  value,
  onChange,
  selectedToken,
  onTokenSelect,
  filteredTokens,
  placeholder = "0",
  disabled = false,
  className,
  min,
  max,
  step,
}: TokenAmountInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { address } = useAccount()
  const { tokens, loading: tokensLoading } = useTokens({
    onlyActive: true,
    filteredTokens,
  })

  const handleTokenSelect = (token: TokenWithImage) => {
    onTokenSelect(token)
    setIsDropdownOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <div className="relative flex h-12 w-full items-center text-sm">
          <input
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "flex h-full w-full rounded-[12px] border-0",
              "bg-neutral-background text-foreground font-semibold",
              "px-4 py-2 pr-20",
              "text-base placeholder:text-muted-foreground",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />

          {/* Token selector dropdown trigger */}
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "absolute right-0 top-1/2 mr-3 flex -translate-y-1/2 transform items-center gap-1",
                "text-foreground font-medium cursor-pointer hover:opacity-80",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <TokenIcon token={selectedToken} size={18} />
              <span>{selectedToken.symbol}</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isDropdownOpen && "rotate-90"
              )} />
            </button>
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent
          className="w-full max-h-60 overflow-y-auto"
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
