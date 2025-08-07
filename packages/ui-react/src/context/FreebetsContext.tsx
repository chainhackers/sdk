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
import { FreeBet, TokenWithImage } from "../types/types"
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
  const { appChainId } = useChain()
  const { affiliate, freebetsAffiliates } = useBettingConfig()
  //const [freebetsInCurrentChain, setFreebetsInCurrentChain] = useState<FreeBet[]>([])
  const [selectedFreebet, setSelectedFreebet] = useState<FreeBet | null>(null)

  const { data: freebets = [] } = useQuery({
    queryKey: ["freebets", accountAddress],
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
    if (freebetsInCurrentChain.length > 0 && !selectedFreebet) {
      setSelectedFreebet(freebetsInCurrentChain[0])
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

    const allFreebets = await fetchFreebets(accountAddress, affiliates)
    console.log("allFreebets: ", allFreebets)

    const formatedFreebets: FreeBet[] = allFreebets.map((freebet) => ({
      id: freebet.id.toString(),
      title: freebet.campaign.label,
      amount: Number(freebet.formattedAmount),
      token: freebet.token as TokenWithImage,
      chainId: freebet.chainId,
      //expiresAt: new Date(freebet.expirationDate).toISOString(),
    }))

    return formatedFreebets
  }

  const selectFreebet = useCallback((freebet: FreeBet | null) => {
    console.log("selectFreebet: ", freebet)
    setSelectedFreebet(freebet)
  }, [])

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
