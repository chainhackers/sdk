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
import { useAccount } from "wagmi"
import { getTokenImage } from "../lib/utils"
import { FreeBet, TokenWithImage } from "../types/types"
import { formatExpireAt } from "../utils/formatExpireAt"
import { useChain } from "./chainContext"
import { useBettingConfig } from "./configContext"
import { useTokenContext } from "./tokenContext"

interface FreebetsContextValue {
  freebets: SignedFreebet[]
  selectedFreebet: SignedFreebet | null
  selectFreebetById: (id: string | null) => void
  isUsingFreebet: boolean
  formattedFreebets: FreeBet[]
  formattedFreebetsInCurrentChain: FreeBet[]
  selectedFormattedFreebet: FreeBet | null
  refetchFreebets: () => void
  freebetsError: Error | null
  toggleUsingFreebet: (isUsingFreebet: boolean) => void
}

const FreebetsContext = createContext<FreebetsContextValue | undefined>(undefined)

interface FreebetsProviderProps {
  children: ReactNode
}

interface FreebetsData {
  freebets: SignedFreebet[]
  formattedFreebets: FreeBet[]
}

interface SelectedFreebet {
  freebet: SignedFreebet
  formattedFreebet: FreeBet
}

export function FreebetsProvider({ children }: FreebetsProviderProps) {
  const { address: accountAddress } = useAccount()
  const { appChainId, switchAppChain, availableChainIds } = useChain()
  const { setSelectedToken } = useTokenContext()
  const { affiliate, freebetsAffiliates, withExternalBankrollFreebets } = useBettingConfig()
  const [selectedFreebet, setSelectedFreebet] = useState<SelectedFreebet | null>(null)
  const [isUsingFreebet, setIsUsingFreebet] = useState(true)

  const {
    data: freebetsData = { freebets: [], formattedFreebets: [] },
    refetch: refetchFreebets,
    error: freebetsError,
  } = useQuery<FreebetsData>({
    queryKey: [
      "freebets",
      accountAddress,
      availableChainIds,
      withExternalBankrollFreebets,
      affiliate,
      freebetsAffiliates,
    ],
    queryFn: fetchFreebetsTokens,
    enabled: !!accountAddress,
    refetchInterval: 30000,
  })

  const formattedFreebetsInCurrentChain = useMemo(() => {
    if (!freebetsData.formattedFreebets.length || !appChainId) {
      return []
    }

    const filteredFreebets = freebetsData.formattedFreebets.filter(
      (freebet) => freebet.chainId === appChainId,
    )

    return filteredFreebets
  }, [freebetsData.formattedFreebets, appChainId])

  useEffect(() => {
    const isFreebetsInCurrentChain = formattedFreebetsInCurrentChain.length > 0
    const isSelectedFreebet = selectedFreebet !== null

    const getFirstFreebet = () => {
      const freebet = freebetsData.freebets.find(
        (freebet) => freebet.chainId === formattedFreebetsInCurrentChain[0].chainId,
      )
      if (!freebet) {
        return null
      }

      return {
        freebet,
        formattedFreebet: formattedFreebetsInCurrentChain[0],
      }
    }

    // If no freebets available in current chain, clear selection
    if (!isFreebetsInCurrentChain && isSelectedFreebet) {
      setSelectedFreebet(null)
      return
    }

    // If freebets available, user wants to use freebets, but none selected - select first
    if (isFreebetsInCurrentChain && isUsingFreebet && !isSelectedFreebet) {
      selectFreebetById(getFirstFreebet()?.formattedFreebet.id || null)
      return
    }

    // If selected freebet is no longer valid, try to select another one if using freebets
    if (isFreebetsInCurrentChain && isSelectedFreebet) {
      const isSelectedStillValid = formattedFreebetsInCurrentChain.some(
        (freebet) => freebet.id.toString() === selectedFreebet.freebet.id.toString(),
      )

      if (!isSelectedStillValid) {
        if (isUsingFreebet) {
          setSelectedFreebet(getFirstFreebet())
        } else {
          setSelectedFreebet(null)
        }
      }
    }
  }, [formattedFreebetsInCurrentChain, isUsingFreebet, freebetsData.freebets])

  async function fetchFreebetsTokens(): Promise<FreebetsData> {
    if (!accountAddress) {
      return { freebets: [], formattedFreebets: [] }
    }

    const affiliates = freebetsAffiliates || (affiliate ? [affiliate] : undefined)

    const allFreebets = await fetchFreebets(
      accountAddress,
      affiliates,
      withExternalBankrollFreebets,
    )

    const filteredFreebetsByChains = allFreebets.filter((freebet) =>
      availableChainIds.includes(freebet.chainId),
    )
    const formattedFreebets = filteredFreebetsByChains.map(formatFreebet)

    return { freebets: filteredFreebetsByChains, formattedFreebets }
  }

  const selectFreebetById = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedFreebet(null)
        return
      }

      const freebet = freebetsData.freebets.find((freebet) => freebet.id.toString() === id) || null

      if (!freebet) {
        setSelectedFreebet(null)
        return
      }

      const formatted = formatFreebet(freebet)

      if (freebet.chainId !== appChainId) {
        switchAppChain(freebet.chainId)
      }

      setSelectedToken(formatted.token)

      setSelectedFreebet({ freebet: freebet, formattedFreebet: formatted })
      setIsUsingFreebet(true)
    },
    [freebetsData, appChainId, switchAppChain, setSelectedToken],
  )

  const toggleUsingFreebet = useCallback((isUsingFreebet: boolean) => {
    setIsUsingFreebet(isUsingFreebet)

    if (!isUsingFreebet) {
      setSelectedFreebet(null)
    }
  }, [])

  function formatFreebet(freebet: SignedFreebet): FreeBet {
    return {
      id: freebet.id.toString(),
      title: freebet.campaign.label,
      amount: Number(freebet.formattedAmount),
      token: {
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      } as TokenWithImage,
      chainId: freebet.chainId,
      expiresAt: formatExpireAt(freebet.expirationDate),
    }
  }

  const contextValue = useMemo(
    () => ({
      freebets: freebetsData.freebets,
      selectedFreebet: selectedFreebet?.freebet || null,
      selectFreebetById,
      isUsingFreebet: isUsingFreebet && !!selectedFreebet,
      formattedFreebets: freebetsData.formattedFreebets,
      formattedFreebetsInCurrentChain,
      selectedFormattedFreebet: selectedFreebet?.formattedFreebet || null,
      refetchFreebets,
      freebetsError,
      toggleUsingFreebet,
    }),
    [
      freebetsData,
      formattedFreebetsInCurrentChain,
      selectedFreebet,
      selectFreebetById,
      refetchFreebets,
      freebetsError,
      isUsingFreebet,
      toggleUsingFreebet,
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
