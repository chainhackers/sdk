import {
  chainByKey,
  GAS_PRICE_TYPE,
  getGasPrices,
  RETURN_TYPE_GAS_PRICES,
} from "@betswirl/sdk-core"
import { WagmiBetSwirlWallet } from "@betswirl/wagmi-provider"
import { useQuery } from "@tanstack/react-query"
import { useConfig } from "wagmi"
import { useChain } from "../context/chainContext"
import { QueryParameter } from "../types/types"

type GetGasPriceResult = {
  detailedGasPrices: RETURN_TYPE_GAS_PRICES
  optimalGasPrice: bigint
}

type UseGasPriceProps = {
  query?: QueryParameter<GetGasPriceResult>
}

const defaultGasPriceResult: GetGasPriceResult = {
  detailedGasPrices: {
    [GAS_PRICE_TYPE.NORMAL]: 0n,
    [GAS_PRICE_TYPE.FAST]: 0n,
    [GAS_PRICE_TYPE.INSTANT]: 0n,
  },
  optimalGasPrice: 0n,
}

/**
 * Fetches current gas prices with network-specific optimizations.
 * Applies buffers to ensure transactions succeed during price fluctuations.
 *
 * @param props.query - Optional query settings (refetchInterval, enabled, etc.)
 * @returns Gas prices in wei for different speeds and recommended optimal price
 * @returns data.detailedGasPrices - Gas prices for normal (5% buffer), fast (20% buffer), instant (50% buffer)
 * @returns data.optimalGasPrice - Best gas price for current network (fast for Polygon/Avalanche, normal for others)
 *
 * @example
 * ```ts
 * const { data: gasPriceData } = useGasPrice({
 *   query: { refetchInterval: 10000 } // Refresh every 10 seconds
 * })
 * console.log('Optimal gas price:', gasPriceData.optimalGasPrice)
 * ```
 */
export function useGasPrice(props: UseGasPriceProps = {}) {
  const config = useConfig()
  const { query = {} } = props

  const { appChain } = useChain()

  const queryFn = async () => {
    const betswirlWallet = new WagmiBetSwirlWallet(config)
    const gasPrices = await getGasPrices(betswirlWallet, appChain.id)

    return {
      detailedGasPrices: {
        [GAS_PRICE_TYPE.NORMAL]: (gasPrices[GAS_PRICE_TYPE.NORMAL] * 105n) / 100n, // 5% buffer
        [GAS_PRICE_TYPE.FAST]: gasPrices[GAS_PRICE_TYPE.FAST], // 20% buffer (already included from sdk)
        [GAS_PRICE_TYPE.INSTANT]: gasPrices[GAS_PRICE_TYPE.INSTANT], // 50% buffer (already included from sdk)
      },
      // From experience, Polygon & Avalanche works better with a fast gas price
      optimalGasPrice: [chainByKey.polygon.id, chainByKey.avalanche.id as number].includes(
        appChain.id,
      )
        ? gasPrices[GAS_PRICE_TYPE.FAST]
        : gasPrices[GAS_PRICE_TYPE.NORMAL],
    }
  }

  const { data, ...rest } = useQuery({
    queryKey: ["/gas-price", appChain.id],
    queryFn,
    refetchOnWindowFocus: false,
    ...query,
  })

  return {
    data: data ?? defaultGasPriceResult,
    ...rest,
  }
}
