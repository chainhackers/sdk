import type { CasinoChainId } from "@betswirl/sdk-core"

const EXPLORER_BASE_BY_CHAIN: Record<number, string> = {
  1: "https://etherscan.io",
  10: "https://optimistic.etherscan.io",
  56: "https://bscscan.com",
  137: "https://polygonscan.com",
  250: "https://ftmscan.com",
  42161: "https://arbiscan.io",
  43114: "https://snowtrace.io",
  8453: "https://basescan.org",
  11155111: "https://sepolia.etherscan.io",
  84532: "https://sepolia.basescan.org",
}

export function getBlockExplorerUrl(chainId: CasinoChainId, address: string): string | null {
  const base = EXPLORER_BASE_BY_CHAIN[Number(chainId)]
  if (!base) return null
  if (!address) return null
  return `${base}/address/${address}`
}
