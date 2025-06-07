import { CASINO_GAME_TYPE, getGamePausedFunctionData } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"

type UseIsGamePausedProps = {
  game: CASINO_GAME_TYPE
}

export function useIsGamePaused(props: UseIsGamePausedProps) {
  const { appChainId } = useChain()
  const functionData = useMemo(() => {
    return getGamePausedFunctionData(props.game, appChainId)
  }, [props.game, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      initialData: false,
    },
  })

  const isPaused = Boolean(wagmiHook.data)

  return {
    wagmiHook,
    isPaused,
  }
}
