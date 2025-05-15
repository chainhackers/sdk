import { createContext, useContext } from "react"
import { Chain, Hex } from "viem"
import { useWriteContract } from "wagmi"

import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
} from "@betswirl/sdk-core"

import { CHAIN } from "../providers.tsx"

const GAS_FEE = 10n ** 13n

export const BetContext = createContext<{
  chain: Chain & { id: CasinoChainId }
}>({ chain: CHAIN })

export function usePlaceBet() {
  const { chain } = useContext(BetContext)
  const {
    data: transactionHash,
    isPending: isPlacingBet,
    error: betError,
    writeContract,
    reset,
  } = useWriteContract()

  const placeBet = (betParams: GenericCasinoBetParams, receiver: Hex) => {
    const {
      data: { to, abi, functionName, args },
      extraData: { getValue },
    } = getPlaceBetFunctionData(
      {
        ...betParams,
        receiver,
      },
      chain.id,
    )

    writeContract({
      abi,
      address: to,
      functionName,
      args,
      chainId: chain.id,
      value: getValue(betParams.betAmount + GAS_FEE),
    })
  }
  return {
    placeBet,
    isPlacingBet,
    betError,
    transactionHash,
    resetWriteContractState: reset,
  }
}
