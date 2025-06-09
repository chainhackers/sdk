import type { CasinoChainId } from "@betswirl/sdk-core"
import { slugById } from "@betswirl/sdk-core"

const TRUST_WALLET_BASE_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains"

const FALLBACK_CHAIN_NAME = "ethereum"

export function getChainIconUrl(chainId: CasinoChainId): string {
  const chainName = slugById[chainId as keyof typeof slugById]

  if (!chainName) {
    return `${TRUST_WALLET_BASE_URL}/${FALLBACK_CHAIN_NAME}/info/logo.png`
  }

  return `${TRUST_WALLET_BASE_URL}/${chainName}/info/logo.png`
}

export function getChainName(chainId: CasinoChainId): string {
  return slugById[chainId as keyof typeof slugById] || FALLBACK_CHAIN_NAME
}
