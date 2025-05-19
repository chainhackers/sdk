import { useAccount } from "wagmi"
import { useBettingConfig } from "../context/useBettingConfig.ts"
import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
  CASINO_GAME_TYPE,
  CoinToss,
  COINTOSS_FACE,
} from "@betswirl/sdk-core"
import { useOnchainKit } from "@coinbase/onchainkit"
import { Hex } from "viem"
import { useCallback } from "react"

export function usePlaceBetTxData(betAmount: bigint, coinFace: COINTOSS_FACE) {
  const { chain } = useOnchainKit()
  const chainId = chain.id as CasinoChainId
  const { affiliate } = useBettingConfig()
  const { address: receiver, isConnected } = useAccount()

  const getPlaceBetTxData = useCallback(() => {
    if (!isConnected || !receiver) {
      throw new Error(
        "Wallet must be connected to build place bet transaction data.",
      )
    }

    const betParams: GenericCasinoBetParams & { receiver: Hex } = {
      affiliate,
      betAmount,
      game: CASINO_GAME_TYPE.COINTOSS,
      gameEncodedInput: CoinToss.encodeInput(coinFace),
      receiver,
    }

    return getPlaceBetFunctionData(betParams, chainId)
  }, [chainId, affiliate, receiver, betAmount, coinFace])

  return { getPlaceBetTxData }
}
