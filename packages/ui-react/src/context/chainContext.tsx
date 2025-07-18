import { CasinoChain, CasinoChainId, casinoChainById, casinoChainIds } from "@betswirl/sdk-core"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { type Chain } from "viem"
import { useAccount, useSwitchChain } from "wagmi"

const CHAIN_STORAGE_KEY = "betswirl-selected-chain"

export type ChainContextValue = {
  appChain: CasinoChain
  appChainId: CasinoChainId
  walletChain: Chain | undefined
  walletChainId: number | undefined
  areChainsSynced: boolean
  availableChains: CasinoChain[]
  switchAppChain: (chainId: CasinoChainId) => void
  switchWalletChain: (chainId: CasinoChainId) => void
}

const ChainContext = createContext<ChainContextValue | null>(null)

export const useChain = () => {
  return useContext(ChainContext) as ChainContextValue
}

export type ChainProviderProps = {
  children: React.ReactNode
  initialChainId: CasinoChainId
  supportedChains?: CasinoChainId[]
}

export const ChainProvider: React.FC<ChainProviderProps> = (props) => {
  const { children, initialChainId, supportedChains } = props

  // Use provided chains or all casino chains
  const availableChainIds = useMemo(() => supportedChains || casinoChainIds, [supportedChains])

  // Validate initialChainId is in supported chains
  const validatedInitialChainId = useMemo(
    () => (availableChainIds.includes(initialChainId) ? initialChainId : availableChainIds[0]),
    [initialChainId, availableChainIds],
  )

  const { address, chainId: walletChainId, chain: walletChain } = useAccount()
  const { switchChain: switchWalletChain } = useSwitchChain()

  // Get stored chain preference
  const getStoredChainId = useCallback((): CasinoChainId | null => {
    if (typeof window === "undefined" || !address) return null

    try {
      const stored = localStorage.getItem(`${CHAIN_STORAGE_KEY}-${address}`)
      if (stored) {
        const chainId = Number(stored) as CasinoChainId
        // Validate stored chain is still in available chains
        return availableChainIds.includes(chainId) ? chainId : null
      }
    } catch (error) {
      console.warn("Failed to read chain preference from localStorage:", error)
    }
    return null
  }, [address, availableChainIds])

  // Initialize chain ID from storage or use validated initial
  const [appChainId, setAppChainId] = useState<CasinoChainId>(() => {
    const stored = getStoredChainId()
    return stored || validatedInitialChainId
  })

  // Get available chain objects
  const availableChains = useMemo(
    () => availableChainIds.map((id) => casinoChainById[id]),
    [availableChainIds],
  )

  // Allow to know if the connected wallet chain and the app chain are the same
  const areChainsSynced = useMemo(() => walletChainId === appChainId, [walletChainId, appChainId])

  const switchAppChain = useCallback(
    (chainId: CasinoChainId) => {
      // Validate chain is supported
      if (!availableChainIds.includes(chainId)) {
        console.warn(`Chain ${chainId} is not in supported chains`)
        return
      }

      // Save chain preference to localStorage
      if (address && typeof window !== "undefined") {
        try {
          localStorage.setItem(`${CHAIN_STORAGE_KEY}-${address}`, chainId.toString())
        } catch (error) {
          console.warn("Failed to save chain preference to localStorage:", error)
        }
      }

      // Set app chain immediately for better UX
      setAppChainId(chainId)

      // Try to switch the wallet chain if connected
      if (address && switchWalletChain) {
        try {
          switchWalletChain({ chainId })
        } catch (error) {
          console.warn("Failed to switch wallet chain:", error)
          // Wallet chain switch failed, but app chain is already updated
          // The UI will show "Switch chain" button for the user to manually switch
        }
      }
    },
    [switchWalletChain, availableChainIds, address],
  )

  const appChain = useMemo(() => casinoChainById[appChainId], [appChainId])

  // Try to switch the app chain automatically each time the wallet chain changes
  useEffect(() => {
    // Check if the wallet chain is supported by the authorized chains
    if (walletChainId && availableChainIds.includes(walletChainId as CasinoChainId)) {
      switchAppChain(walletChainId as CasinoChainId)
    }
  }, [walletChainId, switchAppChain, availableChainIds])

  // Clear chain preference when wallet disconnects
  useEffect(() => {
    if (!address) {
      // Reset to initial chain when disconnected
      setAppChainId(validatedInitialChainId)
    }
  }, [address, validatedInitialChainId])

  const context: ChainContextValue = {
    appChain,
    appChainId,
    walletChain,
    walletChainId,
    areChainsSynced,
    availableChains,
    switchAppChain,
    switchWalletChain: (chainId: CasinoChainId) => switchWalletChain({ chainId }),
  }

  return <ChainContext.Provider value={context}>{children}</ChainContext.Provider>
}
