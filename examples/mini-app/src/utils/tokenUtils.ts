import type { Token as OnchainKitToken } from "@coinbase/onchainkit/token"
import { TokenWithImage } from "../types/types"

/**
 * Filters tokens based on allowed list
 */
export function filterTokensByAllowed(
  tokens: TokenWithImage[],
  allowedTokens: TokenWithImage[],
): TokenWithImage[] {
  return tokens.filter((token) =>
    allowedTokens.some((allowed) => allowed.address.toLowerCase() === token.address.toLowerCase()),
  )
}

/**
 * Converts BetSwirl token to OnchainKit token format
 */
export function convertToOnchainKitToken(token: TokenWithImage, chainId: number): OnchainKitToken {
  return {
    name: token.symbol,
    address: token.address || "",
    symbol: token.symbol,
    decimals: token.decimals,
    image: token.image,
    chainId,
  }
}
