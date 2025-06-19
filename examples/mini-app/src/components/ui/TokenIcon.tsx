import { TokenImage } from "@coinbase/onchainkit/token"
import type { Token as OnchainKitToken } from "@coinbase/onchainkit/token"
import { useChain } from "../../context/chainContext"
import type { TokenWithImage } from "../../types/types"

interface TokenIconProps {
  token: TokenWithImage
  size?: number
  className?: string
}

/**
 * Wrapper component that adapts BetSwirl Token to OnchainKit TokenImage
 * Requires token to have an image property configured
 */
export function TokenIcon({ token, size = 18, className }: TokenIconProps) {
  const { appChainId } = useChain()

  // Convert BetSwirl Token to OnchainKit Token format
  const onchainKitToken: OnchainKitToken = {
    name: token.symbol,
    address: token.address || "",
    symbol: token.symbol,
    decimals: token.decimals,
    image: token.image,
    chainId: appChainId,
  }

  return <TokenImage token={onchainKitToken} size={size} className={className} />
}
