import type { CasinoChainId } from "@betswirl/sdk-core"

type ChainIconMapping = Partial<Record<CasinoChainId, string>>

const CHAIN_NAME_MAPPING: ChainIconMapping = {
  8453: "base",
  84532: "base",
  137: "polygon",
  80002: "polygon",
  43114: "avalanche",
  43113: "avalanche",
  42161: "arbitrum",
  421614: "arbitrum",
  56: "smartchain",
}

const TRUST_WALLET_BASE_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains"

const FALLBACK_CHAIN_NAME = "ethereum"

export function getChainIconUrl(chainId: CasinoChainId): string {
  const chainName = CHAIN_NAME_MAPPING[chainId]

  if (!chainName) {
    return `${TRUST_WALLET_BASE_URL}/${FALLBACK_CHAIN_NAME}/info/logo.png`
  }

  return `${TRUST_WALLET_BASE_URL}/${chainName}/info/logo.png`
}

export function getChainName(chainId: CasinoChainId): string {
  return CHAIN_NAME_MAPPING[chainId] || FALLBACK_CHAIN_NAME
}
