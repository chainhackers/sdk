import { CASINO_GAME_TYPE, SignedFreebet } from "@betswirl/sdk-core"
import { Hex } from "viem"
import { GameChoice, GameDefinition, TokenWithImage } from "./types"

/**
 * Transaction parameters needed to execute a bet via writeContract
 */
export type BetTransactionParameters = {
  abi: any
  address: Hex
  functionName: string
  args: readonly unknown[]
  value: bigint
  gasPrice: bigint
  chainId: number
}

/**
 * Common parameters needed for any bet strategy
 */
export type BetStrategyParams<T extends GameChoice = GameChoice> = {
  betAmount: bigint
  choice: T
  vrfFees: bigint
  gasPrice: bigint
  chainId: number
  gameDefinition: GameDefinition<T>
  game: CASINO_GAME_TYPE
}

/**
 * Interface for bet placement strategies
 * Each strategy encapsulates the logic for preparing transaction data for a specific bet type
 */
export interface IBetStrategy<T extends GameChoice = GameChoice> {
  prepare: (params: BetStrategyParams<T>) => Promise<BetTransactionParameters>
}

/**
 * Configuration for paid bet strategy
 */
export type PaidBetStrategyConfig = {
  token: TokenWithImage
  affiliate: Hex
  connectedAddress: Hex
  chainId: number
}

/**
 * Configuration for freebet strategy
 */
export type FreebetStrategyConfig = {
  freebet: SignedFreebet
  chainId: number
}
