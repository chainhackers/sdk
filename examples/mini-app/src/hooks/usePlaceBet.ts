import { createContext, useContext } from "react"
import { Chain, Hex } from "viem"
import { useWriteContract } from "wagmi"
import { base } from "wagmi/chains"

import {
  CasinoChainId,
  GenericCasinoBetParams,
  getPlaceBetFunctionData,
} from "@betswirl/sdk-core"

import { CHAIN } from "../providers.tsx"

const GAS_FEE = 10n ** 13n

export const BetContext = createContext<{
  chain: Chain & { id: CasinoChainId }
}>({ chain: base })

export function usePlaceBet() {
  const { chain } = useContext(BetContext)
  const { data, writeContract } = useWriteContract()

  const placeBet = (betParams: GenericCasinoBetParams, receiver: Hex) => {
    const {
      data: { to, abi, functionName, args },
    } = getPlaceBetFunctionData(
      {
        ...betParams,
        receiver,
      },
      chain.id,
    )
    console.log(`to=${to}, abi.len=${abi.length}, args=${args}`)

    writeContract({
      abi,
      address: to,
      functionName,
      args,
      chainId: CHAIN.id,
      value: betParams.betAmount + GAS_FEE,
    })
  }
  return { data, placeBet }
}
