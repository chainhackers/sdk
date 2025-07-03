import { createContext, ReactNode, useContext, useState } from "react"
import { TokenWithImage } from "../types/types"

interface TokenContextValue {
  selectedToken: TokenWithImage | undefined
  setSelectedToken: (token: TokenWithImage) => void
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined)

interface TokenProviderProps {
  children: ReactNode
  initialToken?: TokenWithImage
}

export function TokenProvider({ children, initialToken }: TokenProviderProps) {
  const [selectedToken, setSelectedTokenState] = useState<TokenWithImage | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("betswirl-selected-token")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Invalid stored data, ignore
        }
      }
    }
    // Use initialToken if no stored token found
    return initialToken
  })

  const setSelectedToken = (token: TokenWithImage) => {
    setSelectedTokenState(token)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("betswirl-selected-token", JSON.stringify(token))
    }
  }

  return (
    <TokenContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </TokenContext.Provider>
  )
}

export function useTokenContext() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider")
  }
  return context
}
