import { fetchFreebets, SignedFreebet } from "@betswirl/sdk-core"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"

export function useFreebets() {
  const { address: accountAddress } = useAccount()
  const { appChainId } = useChain()
  const { affiliate, freebetsAffiliates } = useBettingConfig()
  const [freebets, setFreebets] = useState<SignedFreebet[]>([])
  const [freebetsInCurrentChain, setFreebetsInCurrentChain] = useState<SignedFreebet[]>([])

  useEffect(() => {
    if (!accountAddress) {
      setFreebets([])
      setFreebetsInCurrentChain([])
      return
    }

    fetchFreebetsTokens()
  }, [accountAddress])

  useEffect(() => {
    console.log("appChainId: ", appChainId)
    if (!freebets.length || !appChainId) {
      return
    }

    console.log("freebets.filter")
    const filteredFreebets = freebets.filter((freebet) => freebet.chainId === appChainId)
    setFreebetsInCurrentChain(filteredFreebets)
  }, [freebets, appChainId])

  const fetchFreebetsTokens = async () => {
    if (!accountAddress) {
      return
    }

    const affiliates = freebetsAffiliates?.length
      ? freebetsAffiliates
      : affiliate
        ? [affiliate]
        : undefined
    console.log("affiliates: ", affiliates)

    const allFreebets = await fetchFreebets(accountAddress, affiliates)
    setFreebets(allFreebets)
  }

  return {
    freebets,
    freebetsInCurrentChain,
    fetchFreebetsTokens,
  }
}
