import { fetchFreebets } from "@betswirl/sdk-core"
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
  freebets: FreeBet[]
  freebetsInCurrentChain: FreeBet[]
  selectedFreebet: FreeBet | null
  selectFreebet: (freebet: FreeBet | null) => void
}

const FreebetsContext = createContext<FreebetsContextValue | undefined>(undefined)

interface FreebetsProviderProps {
  children: ReactNode
}

export function FreebetsProvider({ children }: FreebetsProviderProps) {
  const { address: accountAddress } = useAccount()
  const { appChainId, switchAppChain, availableChainIds } = useChain()
  const { affiliate, freebetsAffiliates, withExternalBankrollFreebets } = useBettingConfig()
  //const [freebetsInCurrentChain, setFreebetsInCurrentChain] = useState<FreeBet[]>([])
  const [selectedFreebet, setSelectedFreebet] = useState<FreeBet | null>(null)

  const { data: freebets = [] } = useQuery({
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

    const formatedFreebets: FreeBet[] = filteredFreebetsByChains.map((freebet) => ({
      id: freebet.id.toString(),
      title: freebet.campaign.label,
      amount: Number(freebet.formattedAmount),
      token: {
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      } as TokenWithImage,
      chainId: freebet.chainId,
      expiresAt: formatExpireAt(freebet.expirationDate),
    }))

    return formatedFreebets
  }

  const selectFreebet = useCallback(
    (freebet: FreeBet | null) => {
      console.log("selectFreebet: ", freebet)

      if (freebet && freebet.chainId !== appChainId) {
        switchAppChain(freebet.chainId)
      }

      setSelectedFreebet(freebet)
    },
    [appChainId, switchAppChain],
  )

  const contextValue = useMemo(
    () => ({
      freebets,
      freebetsInCurrentChain,
      selectedFreebet,
      selectFreebet,
    }),
    [freebets, freebetsInCurrentChain, selectedFreebet, selectFreebet],
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
