import type { CasinoChainId } from "@betswirl/sdk-core"
import { TokenImage } from "@coinbase/onchainkit/token"
import { getChainIconUrl, getChainName } from "../../lib/chainIcons"

interface ChainIconProps {
  chainId: CasinoChainId
  size?: number
  className?: string
}

export function ChainIcon({ chainId, size = 18, className }: ChainIconProps) {
  const chainIconUrl = getChainIconUrl(chainId)
  const chainName = getChainName(chainId)
  
  return (
    <TokenImage
      token={{
        name: chainName,
        address: "",
        symbol: chainName.toUpperCase(),
        decimals: 18,
        image: chainIconUrl,
        chainId,
      }}
      size={size}
      className={className}
    />
  )
}
