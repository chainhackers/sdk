import { BP_VALUE } from "../constants";

//houseEdge is in BP_VALUE
export function getBetSwirlFees(payout: bigint, houseEdge: number): bigint {
  return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE);
}
export function getGrossPayout(
  amount: bigint,
  betCount: number,
  multiplier: number
): bigint {
  return (amount * BigInt(betCount) * BigInt(multiplier)) / BigInt(BP_VALUE);
}
// mulitplier and houseEdge are in BP_VALUE
export function getNetPayout(
  amount: bigint,
  betCount: number,
  multiplier: number,
  houseEdge: number
): bigint {
  const grossPayout = getGrossPayout(amount, betCount, multiplier);
  return grossPayout - getBetSwirlFees(grossPayout, houseEdge);
}
// mulitplier and houseEdge are in BP_VALUE
export function getNetMultiplier(
  multiplier: number,
  houseEdge: number
): number {
  return Math.round(
    (Number(getNetPayout(BigInt(10 ** 18), 1, multiplier, houseEdge)) /
      10 ** 18) *
      BP_VALUE
  );
}
// mulitplier and houseEdge are BP_VALUE
export function getFormattedNetMultiplier(
  multiplier: number,
  houseEdge: number
): number {
  return Number(
    (getNetMultiplier(multiplier, houseEdge) / BP_VALUE).toFixed(3)
  );
}
