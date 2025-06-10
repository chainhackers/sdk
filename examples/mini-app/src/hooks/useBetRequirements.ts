import {
  CASINO_GAME_TYPE,
  Token,
  getBetRequirementsFunctionData,
  maxGameBetCountByType,
} from "@betswirl/sdk-core"
import { useEffect, useMemo, useRef, useState } from "react"
import { formatUnits } from "viem"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"

type UseBetRequirementsProps = {
  game: CASINO_GAME_TYPE
  token: Token
  grossMultiplier: number // BP
}

const MAX_BET_REFETCH_INTERVAL = 120000 // 2 minutes - Max bet depends on bankroll

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
 */
export function useBetRequirements(props: UseBetRequirementsProps) {
  const { appChainId } = useChain()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [debouncedMultiplier, setDebouncedMultiplier] = useState(props.grossMultiplier)

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedMultiplier(props.grossMultiplier)
    }, 500)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [props.grossMultiplier])

  const functionData = useMemo(() => {
    return getBetRequirementsFunctionData(props.token.address, debouncedMultiplier, appChainId)
  }, [props.token.address, debouncedMultiplier, appChainId])

  const wagmiHook = useReadContract({
    abi: functionData.data.abi,
    address: functionData.data.to,
    functionName: functionData.data.functionName,
    args: functionData.data.args,
    chainId: appChainId,
    query: {
      initialData: [false, 0n, 1n],
      refetchInterval: MAX_BET_REFETCH_INTERVAL,
    },
  })

  const isAllowed = Boolean(wagmiHook.data?.[0])

  const maxBetAmount = wagmiHook.data?.[1] ?? 0n
  const formattedMaxBetAmount = maxBetAmount ? formatUnits(maxBetAmount, props.token.decimals) : "0"
  const maxBetCount = Math.min(maxGameBetCountByType[props.game], Number(wagmiHook.data?.[2] ?? 1n))
  return {
    wagmiHook,
    isAllowed,
    maxBetAmount,
    formattedMaxBetAmount,
    maxBetCount,
  }
}
