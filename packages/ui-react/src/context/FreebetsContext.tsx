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
import { QUERY_DEFAULTS } from "../constants/queryDefaults"
import { getTokenImage } from "../lib/utils"
import { FreeBet, TokenWithImage } from "../types/types"
import { formatExpireAt } from "../utils/formatExpireAt"
import { useChain } from "./chainContext"
import { useBettingConfig } from "./configContext"

interface FreebetsContextValue {
  freebets: SignedFreebet[]
  freebetsInCurrentChain: SignedFreebet[]
  selectedFreebet: SignedFreebet | null
  selectFreebet: (freebet: SignedFreebet | null) => void
  selectFreebetById: (id: string | null) => void
  formattedFreebets: FreeBet[]
  formattedFreebetsInCurrentChain: FreeBet[]
  selectedFormattedFreebet: FreeBet | null
  refetchFreebets: () => void
}

const FreebetsContext = createContext<FreebetsContextValue | undefined>(undefined)

interface FreebetsProviderProps {
  children: ReactNode
}

export function FreebetsProvider({ children }: FreebetsProviderProps) {
  const { address: accountAddress } = useAccount()
  const { appChainId, switchAppChain, availableChainIds } = useChain()
  const { affiliate, freebetsAffiliates, withExternalBankrollFreebets } = useBettingConfig()
  const [selectedFreebet, setSelectedFreebet] = useState<SignedFreebet | null>(null)

  const { data: freebets = [], refetch: refetchFreebets } = useQuery({
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
    staleTime: QUERY_DEFAULTS.STALE_TIME,
  })

  const freebetsInCurrentChain = useMemo(() => {
    console.log("appChainId: ", appChainId)
    if (!freebets.length || !appChainId) {
      return []
    }

    console.log("freebets.filter")
    const filteredFreebets = freebets.filter((freebet) => freebet.chainId === appChainId)
    return filteredFreebets
  }, [freebets, appChainId])

  const formatFreebet = useCallback(
    (freebet: SignedFreebet): FreeBet => ({
      id: freebet.id.toString(),
      title: freebet.campaign.label,
      amount: Number(freebet.formattedAmount),
      token: {
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      } as TokenWithImage,
      chainId: freebet.chainId,
      expiresAt: formatExpireAt(freebet.expirationDate),
    }),
    [],
  )

  const formattedFreebets = useMemo(() => freebets.map(formatFreebet), [freebets, formatFreebet])

  const formattedFreebetsInCurrentChain = useMemo(
    () => freebetsInCurrentChain.map(formatFreebet),
    [freebetsInCurrentChain, formatFreebet],
  )

  const selectedFormattedFreebet = useMemo(
    () => (selectedFreebet ? formatFreebet(selectedFreebet) : null),
    [selectedFreebet, formatFreebet],
  )

  useEffect(() => {
    const isFreebetsInCurrentChain = freebetsInCurrentChain.length > 0
    const isSelectedFreebet = selectedFreebet !== null

    if (isFreebetsInCurrentChain && !isSelectedFreebet) {
      setSelectedFreebet(freebetsInCurrentChain[0])
    } else if (!isFreebetsInCurrentChain && isSelectedFreebet) {
      setSelectedFreebet(null)
    }
  }, [freebetsInCurrentChain])

  async function fetchFreebetsTokens() {
    if (!accountAddress) {
      return []
    }

    const affiliates = freebetsAffiliates?.length
      ? freebetsAffiliates
      : affiliate
        ? [affiliate]
        : undefined
    console.log("affiliates: ", affiliates)

    const allFreebets = await fetchFreebets(
      accountAddress,
      affiliates,
      withExternalBankrollFreebets,
    )
    console.log("allFreebets: ", allFreebets)

    const filteredFreebetsByChains = allFreebets.filter((freebet) =>
      availableChainIds.includes(freebet.chainId),
    )

    return filteredFreebetsByChains
  }

  const selectFreebet = useCallback(
    (freebet: SignedFreebet | null) => {
      console.log("selectFreebet: ", freebet)

      if (freebet && freebet.chainId !== appChainId) {
        switchAppChain(freebet.chainId)
      }

      setSelectedFreebet(freebet)
    },
    [appChainId, switchAppChain],
  )

  const selectFreebetById = useCallback(
    (id: string | null) => {
      if (!id) {
        selectFreebet(null)
        return
      }

      const freebet = freebets.find((freebet) => freebet.id.toString() === id) || null
      selectFreebet(freebet)
    },
    [freebets, selectFreebet],
  )

  const contextValue = useMemo(
    () => ({
      freebets,
      freebetsInCurrentChain,
      selectedFreebet,
      selectFreebet,
      selectFreebetById,
      formattedFreebets,
      formattedFreebetsInCurrentChain,
      selectedFormattedFreebet,
      refetchFreebets,
    }),
    [
      freebets,
      freebetsInCurrentChain,
      selectedFreebet,
      selectFreebet,
      selectFreebetById,
      formattedFreebets,
      formattedFreebetsInCurrentChain,
      selectedFormattedFreebet,
      refetchFreebets,
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
