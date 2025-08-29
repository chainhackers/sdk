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
import { FreeBet, TokenWithImage } from "../types/types"
import { formatExpireAt } from "../utils/formatExpireAt"
import { useChain } from "./chainContext"
import { useBettingConfig } from "./configContext"
import { useTokenContext } from "./tokenContext"

interface FreebetsContextValue {
  freebets: FreeBet[]
  selectedFreebet: FreeBet | null
  selectFreebetById: (id: string | null) => void
  currentChainFreebets: FreeBet[]
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
  const { affiliate, freebetsAffiliates, withExternalBankrollFreebets, filteredTokens } =
    useBettingConfig()
  const [selectedFreebet, setSelectedFreebet] = useState<FreeBet | null>(null)
  const [isUsingFreebet, setIsUsingFreebet] = useState(true)

  const {
    data: freebetsData = [],
    refetch: refetchFreebets,
    error: freebetsError,
  } = useQuery<SignedFreebet[], Error, FreeBet[]>({
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
    select: (data: SignedFreebet[]) => {
      console.log(
        "📥 [FreebetsContext] Freebets fetched from API:",
        JSON.stringify({
          count: data.length,
          ids: data.map((f) => f.id),
          timestamp: new Date().toISOString(),
        }),
      )
      return data.map(formatFreebet)
    },
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
    console.log("🚫 [FreebetsContext] deselectFreebet called")
    setIsUsingFreebet(false)
    setSelectedFreebet(null)
  }, [])

  const selectFreebetById = useCallback(
    (id: string | null) => {
      console.log(
        "📌 [FreebetsContext] selectFreebetById called:",
        `id=${id}, caller=${new Error().stack?.split("\n")[2]?.trim()}`,
      )

      if (!id) {
        deselectFreebet()
        return
      }

      const freebet = freebetsData.find((freebet) => freebet.id.toString() === id) || null

      if (!freebet) {
        console.log("❌ [FreebetsContext] Freebet not found:", id)
        deselectFreebet()
        return
      }

      if (freebet.chainId !== appChainId) {
        switchAppChain(freebet.chainId)
      }

      console.log(
        "✅ [FreebetsContext] Freebet selected:",
        `id=${freebet.id}, token=${freebet.token.symbol}, amount=${freebet.amount}`,
      )
      setSelectedToken(freebet.token)
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
      console.log(
        "🔎 [FreebetsContext] getFirstFreebet called:",
        `found=${freebet?.id}, chainId=${currentChainFreebets[0]?.chainId}, ` +
          `dataIds=[${freebetsData
            .map((f) => f.id)
            .slice(0, 5)
            .join(",")}...], ` +
          `currentIds=[${currentChainFreebets
            .map((f) => f.id)
            .slice(0, 5)
            .join(",")}...]`,
      )
      if (!freebet) {
        return null
      }

      return freebet
    }

    // If no freebets available in current chain, clear selection
    if (!isFreebetsInCurrentChain && isSelectedFreebet) {
      console.log("🚫 [FreebetsContext] useEffect: No freebets in current chain, deselecting")
      deselectFreebet()
      return
    }

    // If freebets available, user wants to use freebets, but none selected - select first
    if (isFreebetsInCurrentChain && isUsingFreebet && !isSelectedFreebet) {
      console.log("🔍 [FreebetsContext] No freebet selected, auto-selecting first")
      selectFreebetById(getFirstFreebet()?.id || null)
      return
    }

    // If selected freebet is no longer valid, try to select another one if using freebets
    if (isFreebetsInCurrentChain && isSelectedFreebet) {
      const isSelectedStillValid = currentChainFreebets.some(
        (freebet) => freebet.id === selectedFreebet.id,
      )

      console.log(
        "🔄 [FreebetsContext] useEffect: Checking if selected freebet still valid:",
        `selectedId=${selectedFreebet.id}, isStillValid=${isSelectedStillValid}, ` +
          `currentIds=[${currentChainFreebets
            .map((f) => f.id)
            .slice(0, 5)
            .join(",")}...]`,
      )

      if (!isSelectedStillValid) {
        console.log(
          "⚠️ [FreebetsContext] Selected freebet no longer valid!",
          `selectedId=${selectedFreebet.id}, availableIds=[${currentChainFreebets
            .map((f) => f.id)
            .slice(0, 5)
            .join(",")}...], ` + `isUsingFreebet=${isUsingFreebet}`,
        )
        const firstFreebet = getFirstFreebet()
        const isFirstFreebetSameTokenAndChain =
          firstFreebet &&
          firstFreebet.token.symbol === selectedFreebet.token.symbol &&
          firstFreebet.chainId === selectedFreebet.chainId

        if (isUsingFreebet && firstFreebet && isFirstFreebetSameTokenAndChain) {
          console.log(
            "🎯 [FreebetsContext] Auto-selecting new freebet with same token:",
            `oldId=${selectedFreebet.id}, newId=${firstFreebet.id}, token=${firstFreebet.token.symbol}`,
          )
          selectFreebetById(firstFreebet.id)
        } else {
          console.log("❌ [FreebetsContext] Deselecting freebet - no suitable replacement")
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

  function formatFreebet(freebet: SignedFreebet): FreeBet {
    return {
      id: freebet.id.toString(),
      title: freebet.campaign.label,
      amount: freebet.amount,
      formattedAmount: freebet.formattedAmount,
      token: {
        ...freebet.token,
        image: getTokenImage(freebet.token.symbol),
      } as TokenWithImage,
      chainId: freebet.chainId,
      expiresAt: formatExpireAt(freebet.expirationDate),
      signed: freebet,
    }
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
