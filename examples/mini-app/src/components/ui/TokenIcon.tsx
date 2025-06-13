import { Token } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import type { Token as OnchainKitToken } from "@coinbase/onchainkit/token"
import { useChain } from "../../context/chainContext"

interface TokenIconProps {
  token: Token
  size?: number
  className?: string
}

const TOKEN_IMAGES: Record<string, string> = {
  ETH: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
  DEGEN:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png",
}

/**
 * Wrapper component that adapts BetSwirl Token to OnchainKit TokenImage
 * Maintains the same styling as the existing TokenImage usage
 */
export function TokenIcon({ token, size = 18, className }: TokenIconProps) {
  const { appChainId } = useChain()

  // Convert BetSwirl Token to OnchainKit Token format
  const onchainKitToken: OnchainKitToken = {
    name: token.symbol,
    address: token.address || "",
    symbol: token.symbol,
    decimals: token.decimals,
    image: TOKEN_IMAGES[token.symbol] || "",
    chainId: appChainId,
  }

  return <TokenImage token={onchainKitToken} size={size} className={className} />
}
