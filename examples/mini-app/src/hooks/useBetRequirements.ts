import { CASINO_GAME_TYPE, Token, getBetRequirementsFunctionData, maxGameBetCountByType } from "@betswirl/sdk-core"
import { useMemo } from "react"
import { useReadContract } from "wagmi"
import { useChain } from "../context/chainContext"
import { formatUnits } from "viem"

type UseBetRequirementsProps = {
    game: CASINO_GAME_TYPE
    token: Token
    grossMultiplier: number // BP
}
export function useBetRequirements(props: UseBetRequirementsProps) {
    const { appChainId } = useChain()
    const functionData = useMemo(() => {
        return getBetRequirementsFunctionData(props.token.address, props.grossMultiplier, appChainId)
    }, [props.token.address, props.grossMultiplier, appChainId])

    const wagmiHook = useReadContract({
        abi: functionData.data.abi,
        address: functionData.data.to,
        functionName: functionData.data.functionName,
        args: functionData.data.args,
        chainId: appChainId,
        query: {
            initialData: [false, 0n, 1n],
            refetchInterval: 120000 // Max bet amount depends directly of the bankroll, it means it has been updated reguarly
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
