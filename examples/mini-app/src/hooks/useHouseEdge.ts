import { CASINO_GAME_TYPE, Token, getAffiliateHouseEdgeFunctionData } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { PLACEHOLDER_AFFILIATE_HOUSE_EDGE } from "../consts"
import { useChain } from "../context/chainContext"
import { useBettingConfig } from "../context/configContext"

type UseHouseEdgeProps = {
  game: CASINO_GAME_TYPE
  token: Token
}
export function useHouseEdge(props: UseHouseEdgeProps) {
  const { appChainId } = useChain()
  const { affiliate } = useBettingConfig()
  const functionData = useMemo(() => {
    return getAffiliateHouseEdgeFunctionData(props.game, props.token.address, affiliate, appChainId)
  }, [props.game, props.token.address, affiliate, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      initialData: PLACEHOLDER_AFFILIATE_HOUSE_EDGE,
    },
  })

  const houseEdge = wagmiHook.data ?? PLACEHOLDER_AFFILIATE_HOUSE_EDGE

  const houseEdgePercent = useMemo(() => {
    return houseEdge / 100
  }, [houseEdge])

  return {
    wagmiHook,
    houseEdge,
    houseEdgePercent,
  }
}
