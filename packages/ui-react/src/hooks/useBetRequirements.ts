import {
  CASINO_GAME_TYPE,
  getBetRequirementsFunctionData,
  maxGameBetCountByType,
  Token,
} from "@betswirl/sdk-core"
import { useMemo } from "react"
import { formatUnits } from "viem"
import { useReadContract } from "wagmi"
import { REFETCH_INTERVALS } from "../constants/queryDefaults"
import { useChain } from "../context/chainContext"
import { useDebounce } from "./useDebounce"

type UseBetRequirementsProps = {
  game: CASINO_GAME_TYPE
  token: Token
  grossMultiplier: number // BP
}

const DEBOUNCE_DELAY = 500 // 500ms - Debounce delay for grossMultiplier updates

/**
 * Retrieves betting requirements and restrictions for a specific game and token
 * @param props.game - The casino game type
 * @param props.token - The token to be used for betting
 * @param props.grossMultiplier - The gross multiplier in basis points (BP)
 * @returns Object containing:
 *   - wagmiHook: The underlying wagmi useReadContract hook instance
 *   - isAllowed: Whether the token is allowed for betting
 *   - maxBetAmount: Maximum allowed bet amount in wei
 *   - formattedMaxBetAmount: Human-readable max bet amount
 *   - maxBetCount: Maximum number of simultaneous bets allowed
 *   - isLoading: Whether the bet requirements are currently being loaded
 */
export function useBetRequirements(props: UseBetRequirementsProps) {
  const { appChainId } = useChain()
  const debouncedMultiplier = useDebounce(props.grossMultiplier, DEBOUNCE_DELAY)

  const functionData = useMemo(() => {
    return getBetRequirementsFunctionData(props.token.address, debouncedMultiplier, appChainId)
  }, [props.token.address, debouncedMultiplier, appChainId])

  console.log({ functionData })

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      refetchInterval: REFETCH_INTERVALS.BET_REQUIREMENTS,
    },
  })

  console.log("data", wagmiHook.data)
  console.log({ game: props.game })

  const isAllowed = Boolean(wagmiHook.data?.[0])
  const isLoading = wagmiHook.isLoading || wagmiHook.isFetching

  const maxBetAmount = wagmiHook.data?.[1] ?? 0n
  const formattedMaxBetAmount = maxBetAmount ? formatUnits(maxBetAmount, props.token.decimals) : "0"
  const maxBetCount = Math.min(maxGameBetCountByType[props.game], Number(wagmiHook.data?.[2] ?? 1n))
  return {
    wagmiHook,
    isAllowed,
    maxBetAmount,
    formattedMaxBetAmount,
    maxBetCount,
    isLoading,
  }
}
