import type { CasinoChainId } from "@betswirl/sdk-core"
import { slugById } from "@betswirl/sdk-core"

const BETSWIRL_CHAINS_BASE_URL = "https://www.betswirl.com/img/chains"

const FALLBACK_CHAIN_NAME = "ethereum"

export function getChainIconUrl(chainId: CasinoChainId): string {
  const chainName = slugById[chainId as keyof typeof slugById]

  if (!chainName) {
    return `${BETSWIRL_CHAINS_BASE_URL}/${FALLBACK_CHAIN_NAME}.svg`
  }

  return `${BETSWIRL_CHAINS_BASE_URL}/${chainName}.svg`
}

export function getChainName(chainId: CasinoChainId): string {
  return slugById[chainId as keyof typeof slugById] || FALLBACK_CHAIN_NAME
}
