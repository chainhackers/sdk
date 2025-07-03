import { CASINO_GAME_TYPE, getGamePausedFunctionData } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"

type UseIsGamePausedProps = {
  game: CASINO_GAME_TYPE
}

/**
 * Checks if a specific game type is currently paused on the blockchain
 * @param props.game - The casino game type to check
 * @returns Object containing:
 *   - wagmiHook: The underlying wagmi useReadContract hook instance
 *   - isPaused: Boolean indicating if the game is currently paused
 */
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
