import { BP_VALUE } from "../constants";
import { CASINO_GAME_TYPE, type ChainId, type NORMAL_CASINO_GAME_TYPE, slugById } from "../data";
import { CoinToss } from "../entities/casino/cointoss";
import { Dice } from "../entities/casino/dice";
import { Keno } from "../entities/casino/keno";
import { Roulette } from "../entities/casino/roulette";
import { WeightedGame } from "../entities/casino/weightedGame";
import type { BP } from "../interfaces";
import type { WeightedGameConfiguration } from "../read";

export function getBetSwirlFees(payout: bigint, houseEdge: BP): bigint {
  return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE);
}

export function getGrossPayout(amount: bigint, betCount: number, grossMulitplier: BP): bigint {
  return (amount * BigInt(betCount) * BigInt(grossMulitplier)) / BigInt(BP_VALUE);
}

export function getNetPayout(
  amount: bigint,
  betCount: number,
  grossMultiplier: BP,
  houseEdge: BP,
): bigint {
  const grossPayout = getGrossPayout(amount, betCount, grossMultiplier);
  return grossPayout - getBetSwirlFees(grossPayout, houseEdge);
}
export function getNetMultiplier(grossMulitplier: BP, houseEdge: BP): number {
  return Math.round(
    (Number(getNetPayout(BigInt(10 ** 18), 1, grossMulitplier, houseEdge)) / 10 ** 18) * BP_VALUE,
  );
}

export function getFormattedNetMultiplier(grossMulitplier: BP, houseEdge: BP): number {
  return Number((getNetMultiplier(grossMulitplier, houseEdge) / BP_VALUE).toFixed(3));
}

export function getPayoutDetails(
  amount: bigint,
  betCount: number,
  grossMultiplier: BP,
  houseEdge: BP,
): {
  grossPayout: bigint;
  netPayout: bigint;
  betSwirlFees: bigint;
  netMultiplier: number;
  formattedNetMultiplier: number;
} {
  const grossPayout = getGrossPayout(amount, betCount, grossMultiplier);
  const fees = getBetSwirlFees(grossPayout, houseEdge);
  const netPayout = grossPayout - fees;
  const netMultiplier = getNetMultiplier(grossMultiplier, houseEdge);
  const formattedNetMultiplier = getFormattedNetMultiplier(grossMultiplier, houseEdge);
  return {
    grossPayout,
    netPayout,
    betSwirlFees: fees,
    netMultiplier,
    formattedNetMultiplier,
  };
}

export function decodeNormalCasinoInput(encodedInput: string, game: NORMAL_CASINO_GAME_TYPE): any {
  switch (game) {
    case CASINO_GAME_TYPE.DICE:
      return Dice.decodeInput(encodedInput);
    case CASINO_GAME_TYPE.COINTOSS:
      return CoinToss.decodeInput(encodedInput);
    case CASINO_GAME_TYPE.ROULETTE:
      return Roulette.decodeInput(encodedInput);
    case CASINO_GAME_TYPE.KENO:
      return Keno.decodeInput(encodedInput);
  }
}

export function decodeWeightedCasinoInput(
  encodedInput: string,
  _weightedGameConfiguration: WeightedGameConfiguration,
  _houseEdge: BP = 0,
) {
  return WeightedGame.decodeInput(encodedInput);
}
export function decodeNormalCasinoRolled(
  encodedRolled: string,
  game: NORMAL_CASINO_GAME_TYPE,
): any {
  switch (game) {
    case CASINO_GAME_TYPE.DICE:
      return Dice.decodeRolled(encodedRolled);
    case CASINO_GAME_TYPE.COINTOSS:
      return CoinToss.decodeRolled(encodedRolled);
    case CASINO_GAME_TYPE.ROULETTE:
      return Roulette.decodeRolled(encodedRolled);
    case CASINO_GAME_TYPE.KENO:
      return Keno.decodeRolled(encodedRolled);
  }
}
export function decodeWeightedCasinoRolled(
  encodedRolled: string,
  weightedGameConfiguration: WeightedGameConfiguration,
  houseEdge: BP = 0,
): any {
  return WeightedGame.decodeRolled(encodedRolled, weightedGameConfiguration, houseEdge);
}

export function formatChainlinkSubscriptionUrl(subscriptionId: string | bigint, chainId: ChainId) {
  return `https://vrf.chain.link/${slugById[chainId]}#/side-drawer/subscription/${
    slugById[chainId]
  }/${subscriptionId.toString()}`;
}
