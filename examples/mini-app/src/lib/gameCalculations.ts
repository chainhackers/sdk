import { BP_VALUE } from "@betswirl/sdk-core"

const ONE_ETHER = 1000000000000000000n

export interface GameCalculationParams {
  houseEdge: number
  grossMultiplier: number
}

export interface PayoutCalculationResult {
  grossPayout: bigint
  fees: bigint
  netPayout: bigint
}

export function getFees(payout: bigint, houseEdge: number): bigint {
  return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE)
}

export function getGrossPayout(amount: bigint, numBets: number, grossMultiplier: number): bigint {
  return (amount * BigInt(numBets) * BigInt(grossMultiplier)) / BigInt(BP_VALUE)
}

export function getNetPayout(
  amount: bigint,
  numBets: number,
  params: GameCalculationParams,
): bigint {
  const grossPayout = getGrossPayout(amount, numBets, params.grossMultiplier)
  return grossPayout - getFees(grossPayout, params.houseEdge)
}

export function calculatePayoutDetails(
  amount: bigint,
  numBets: number,
  params: GameCalculationParams,
): PayoutCalculationResult {
  const grossPayout = getGrossPayout(amount, numBets, params.grossMultiplier)
  const fees = getFees(grossPayout, params.houseEdge)
  const netPayout = grossPayout - fees

  return {
    grossPayout,
    fees,
    netPayout,
  }
}

export function formatMultiplier(params: GameCalculationParams): number {
  const netPayout = getNetPayout(ONE_ETHER, 1, params)
  return Number(Number(netPayout) / 1e18)
}

export function calculateTargetPayout(
  betAmount: bigint | undefined,
  params: GameCalculationParams,
): bigint {
  return betAmount && betAmount > 0n ? getNetPayout(betAmount, 1, params) : 0n
}
