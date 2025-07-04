import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { type Address } from "viem"
import { useTokens } from "../hooks/useTokens"
import { TokenWithImage } from "../types/types"
import { useChain } from "./chainContext"

const STORAGE_KEY = "betswirl-selected-token-address"

interface TokenContextValue {
  selectedToken: TokenWithImage | undefined
  setSelectedToken: (token: TokenWithImage) => void
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined)

interface TokenProviderProps {
  children: ReactNode
  initialToken?: TokenWithImage
}

function getStoredTokenAddress(chainId: number): Address | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const stored = sessionStorage.getItem(`${STORAGE_KEY}-${chainId}`)
    return stored as Address | null
  } catch {
    return null
  }
}

function storeTokenAddress(address: Address, chainId: number): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.setItem(`${STORAGE_KEY}-${chainId}`, address)
  } catch {
    // Ignore storage errors
  }
}

export function TokenProvider({ children, initialToken }: TokenProviderProps) {
  const { tokens, loading } = useTokens()
  const { appChainId } = useChain()
  const [selectedToken, setSelectedTokenInternal] = useState<TokenWithImage | undefined>()

  useEffect(() => {
    if (loading || tokens.length === 0) {
      return
    }

    const storedAddress = getStoredTokenAddress(appChainId)
    if (storedAddress) {
      const foundToken = tokens.find((token) => token.address === storedAddress)
      if (foundToken) {
        setSelectedTokenInternal(foundToken)
        return
      }
    }

    setSelectedTokenInternal(initialToken)
  }, [tokens, loading, initialToken, appChainId])

  const setSelectedToken = (token: TokenWithImage) => {
    setSelectedTokenInternal(token)
    storeTokenAddress(token.address, appChainId)
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
