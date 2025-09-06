import { fetchFreebets, SignedFreebet } from "@betswirl/sdk-core"
import { useQuery } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { zeroAddress } from "viem"
import { useAccount } from "wagmi"
import { getTokenImage } from "../lib/utils"
import { useChain } from "./chainContext"
import { useBettingConfig } from "./configContext"
import { useTokenContext } from "./tokenContext"

interface FreebetsContextValue {
  freebets: SignedFreebet[]
  selectedFreebet: SignedFreebet | null
  selectFreebetById: (id: number | null) => void
  currentChainFreebets: SignedFreebet[]
  isUsingFreebet: boolean
  refetchFreebets: () => void
  freebetsError: Error | null
}

const FreebetsContext = createContext<FreebetsContextValue | undefined>(undefined)

interface FreebetsProviderProps {
  children: ReactNode
}

export function FreebetsProvider({ children }: FreebetsProviderProps) {
  const { address: accountAddress } = useAccount()
  const { appChainId, switchAppChain, availableChainIds } = useChain()
  const { setSelectedToken } = useTokenContext()
  const { affiliate, freebetsAffiliates, withExternalBankrollFreebets, filteredTokens, testMode } =
    useBettingConfig()
  const [selectedFreebet, setSelectedFreebet] = useState<SignedFreebet | null>(null)
  const [isUsingFreebet, setIsUsingFreebet] = useState(true)

  const {
    data: freebetsData = [],
    refetch: refetchFreebets,
    error: freebetsError,
  } = useQuery<SignedFreebet[], Error, SignedFreebet[]>({
    queryKey: [
      "freebets",
      accountAddress,
      availableChainIds,
      withExternalBankrollFreebets,
      affiliate,
      freebetsAffiliates,
      filteredTokens,
    ],
    queryFn: fetchFreebetsTokens,
    enabled: !!accountAddress,
    refetchInterval: 30000,
  })

  const currentChainFreebets = useMemo(() => {
    if (!freebetsData.length || !appChainId) {
      return []
    }

    const filteredFreebets = freebetsData.filter((freebet) => freebet.chainId === appChainId)

    return filteredFreebets
  }, [freebetsData, appChainId])

  const deselectFreebet = useCallback(() => {
    setIsUsingFreebet(false)
    setSelectedFreebet(null)
  }, [])

  const selectFreebetById = useCallback(
    (id: number | null) => {
      if (!id) {
        deselectFreebet()
        return
      }

      const freebet = freebetsData.find((freebet) => freebet.id === id) || null

      if (!freebet) {
        deselectFreebet()
        return
      }

      if (freebet.chainId !== appChainId) {
        switchAppChain(freebet.chainId)
      }

      setSelectedToken({
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      })
      setSelectedFreebet(freebet)
      setIsUsingFreebet(true)
    },
    [freebetsData, appChainId, switchAppChain, setSelectedToken, deselectFreebet],
  )

  useEffect(() => {
    const isFreebetsInCurrentChain = currentChainFreebets.length > 0
    const isSelectedFreebet = selectedFreebet !== null

    const getFirstFreebet = () => {
      const freebet = freebetsData.find(
        (freebet) => freebet.chainId === currentChainFreebets[0].chainId,
      )
      if (!freebet) {
        return null
      }

      return freebet
    }

    // If no freebets available in current chain, clear selection
    if (!isFreebetsInCurrentChain && isSelectedFreebet) {
      deselectFreebet()
      return
    }

    // If freebets available, user wants to use freebets, but none selected - select first
    if (isFreebetsInCurrentChain && isUsingFreebet && !isSelectedFreebet) {
      selectFreebetById(getFirstFreebet()?.id || null)
      return
    }

    // If selected freebet is no longer valid, try to select another one if using freebets
    if (isFreebetsInCurrentChain && isSelectedFreebet) {
      const isSelectedStillValid = currentChainFreebets.some(
        (freebet) => freebet.id === selectedFreebet.id,
      )

      if (!isSelectedStillValid) {
        const firstFreebet = getFirstFreebet()
        const isFirstFreebetSameTokenAndChain =
          firstFreebet &&
          firstFreebet.token.symbol === selectedFreebet.token.symbol &&
          firstFreebet.chainId === selectedFreebet.chainId

        if (isUsingFreebet && firstFreebet && isFirstFreebetSameTokenAndChain) {
          selectFreebetById(firstFreebet.id)
        } else {
          deselectFreebet()
        }
      }
    }
  }, [
    currentChainFreebets,
    isUsingFreebet,
    freebetsData,
    selectedFreebet,
    deselectFreebet,
    selectFreebetById,
  ])

  async function fetchFreebetsTokens(): Promise<SignedFreebet[]> {
    if (!accountAddress) {
      return []
    }

    const affiliates = freebetsAffiliates || (affiliate ? [affiliate] : undefined)

    const allFreebets = await fetchFreebets(
      accountAddress,
      affiliates,
      withExternalBankrollFreebets,
      testMode,
    )

    const filteredFreebets = allFreebets.filter((freebet) => {
      if (!availableChainIds.includes(freebet.chainId)) {
        return false
      }

      if (filteredTokens && filteredTokens.length > 0) {
        if (freebet.token.address === zeroAddress) {
          return true
        }
        return filteredTokens.includes(freebet.token.address)
      }

      return true
    })

    return filteredFreebets
  }

  const contextValue = useMemo(
    () => ({
      freebets: freebetsData,
      selectedFreebet,
      selectFreebetById,
      currentChainFreebets,
      isUsingFreebet: isUsingFreebet && !!selectedFreebet,
      refetchFreebets,
      freebetsError,
    }),
    [
      freebetsData,
      selectedFreebet,
      selectFreebetById,
      currentChainFreebets,
      refetchFreebets,
      freebetsError,
      isUsingFreebet,
    ],
  )

  return <FreebetsContext.Provider value={contextValue}>{children}</FreebetsContext.Provider>
}

export function useFreebetsContext() {
  const context = useContext(FreebetsContext)
  if (!context) {
    throw new Error("useFreebets must be used within a FreebetsProvider")
  }
  return context
}
