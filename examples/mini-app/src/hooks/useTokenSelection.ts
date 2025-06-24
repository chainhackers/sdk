import { CASINO_GAME_TYPE } from "@betswirl/sdk-core"
import { useState } from "react"
import { TokenWithImage } from "../types/types"

/**
 * Hook for managing token selection with session storage persistence
 */
export function useTokenSelection(gameType: CASINO_GAME_TYPE) {
  const [selectedToken, setSelectedTokenState] = useState<TokenWithImage | undefined>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`betswirl-selected-token-${gameType}`)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Invalid stored data, ignore
        }
      }
    }
    return undefined
  })

  const setSelectedToken = (token: TokenWithImage) => {
    setSelectedTokenState(token)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`betswirl-selected-token-${gameType}`, JSON.stringify(token))
    }
  }

  return {
    selectedToken,
    setSelectedToken,
  }
}
