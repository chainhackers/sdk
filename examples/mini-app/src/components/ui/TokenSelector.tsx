import { TokenSelectDropdown } from "@coinbase/onchainkit/token"
import type { Token as OnchainKitToken } from "@coinbase/onchainkit/token"
import { useMemo } from "react"
import { useChain } from "../../context/chainContext"
import { TokenWithImage } from "../../types/types"
import { useTokens } from "../../hooks/useTokens"
import { convertToOnchainKitToken } from "../../utils/tokenUtils"

interface TokenSelectorProps {
  selectedToken?: TokenWithImage
  onTokenSelect: (token: TokenWithImage) => void
  filteredTokens?: TokenWithImage[]
  className?: string
}

/**
 * Token selector component using OnchainKit's TokenSelectDropdown
 * Shows token symbol and icon for each option
 */
export function TokenSelector({
  selectedToken,
  onTokenSelect,
  filteredTokens,
  className,
}: TokenSelectorProps) {
  const { appChainId } = useChain()
  const { tokens, loading, error } = useTokens({
    onlyActive: true,
    filteredTokens,
  })

  // Convert BetSwirl tokens to OnchainKit format
  const onchainKitTokens: OnchainKitToken[] = useMemo(() =>
    tokens.map(token => convertToOnchainKitToken(token, appChainId)),
    [tokens, appChainId]
  )

  const selectedOnchainKitToken: OnchainKitToken | undefined = useMemo(() =>
    selectedToken ? convertToOnchainKitToken(selectedToken, appChainId) : undefined,
    [selectedToken, appChainId]
  )

  const handleTokenSelect = (onchainKitToken: OnchainKitToken) => {
    // Find the corresponding BetSwirl token
    const betswirlToken = tokens.find(token =>
      token.address.toLowerCase() === onchainKitToken.address.toLowerCase()
    )

    if (betswirlToken) {
      onTokenSelect(betswirlToken)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Loading tokens...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <span className="text-sm text-destructive">Failed to load tokens</span>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <span className="text-sm text-muted-foreground">No tokens available</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <TokenSelectDropdown
        token={selectedOnchainKitToken}
        setToken={handleTokenSelect}
        options={onchainKitTokens}
      />
    </div>
  )
}
