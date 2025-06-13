import type { Token } from "@betswirl/sdk-core"
import type { Hex } from "viem"

export const ETH_TOKEN: Token = {
  address: "0x0000000000000000000000000000000000000000" as Hex,
  symbol: "ETH",
  decimals: 18,
}

export const DEGEN_TOKEN: Token = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" as Hex,
  symbol: "DEGEN",
  decimals: 18,
}
