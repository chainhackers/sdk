import { BP_VALUE } from "../constants";
import { CASINO_GAME_TYPE, type ChainId, type NORMAL_CASINO_GAME_TYPE, slugById } from "../data";
import { CoinToss } from "../entities/casino/cointoss";
import { Dice } from "../entities/casino/dice";
import { Keno } from "../entities/casino/keno";
import { Roulette } from "../entities/casino/roulette";
import { WeightedGame } from "../entities/casino/weightedGame";
import type { WeightedGameConfiguration } from "../read";

//houseEdge is in BP_VALUE
export function getBetSwirlFees(payout: bigint, houseEdge: number): bigint {
  return (payout * BigInt(houseEdge)) / BigInt(BP_VALUE);
}
export function getGrossPayout(amount: bigint, betCount: number, multiplier: number): bigint {
  return (amount * BigInt(betCount) * BigInt(multiplier)) / BigInt(BP_VALUE);
}
// mulitplier and houseEdge are in BP_VALUE
export function getNetPayout(
  amount: bigint,
  betCount: number,
  multiplier: number,
  houseEdge: number,
): bigint {
  const grossPayout = getGrossPayout(amount, betCount, multiplier);
  return grossPayout - getBetSwirlFees(grossPayout, houseEdge);
}
// multiplier and houseEdge are in BP_VALUE
export function getNetMultiplier(multiplier: number, houseEdge: number): number {
  return Math.round(
    (Number(getNetPayout(BigInt(10 ** 18), 1, multiplier, houseEdge)) / 10 ** 18) * BP_VALUE,
  );
}
// multiplier and houseEdge are BP_VALUE
export function getFormattedNetMultiplier(multiplier: number, houseEdge: number): number {
  return Number((getNetMultiplier(multiplier, houseEdge) / BP_VALUE).toFixed(3));
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

// houseEdge is in BP_VALUE
export function decodeWeightedCasinoInput(
  encodedInput: string,
  _weightedGameConfiguration: WeightedGameConfiguration,
  _houseEdge = 0,
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
// houseEdge is in BP_VALUE
export function decodeWeightedCasinoRolled(
  encodedRolled: string,
  weightedGameConfiguration: WeightedGameConfiguration,
  houseEdge = 0,
): any {
  return WeightedGame.decodeRolled(encodedRolled, weightedGameConfiguration, houseEdge);
}

export function formatChainlinkSubscriptionUrl(subscriptionId: string | bigint, chainId: ChainId) {
  return `https://vrf.chain.link/${slugById[chainId]}#/side-drawer/subscription/${
    slugById[chainId]
  }/${subscriptionId.toString()}`;
}
