import { type Address, type Hex, formatUnits } from "viem";
import type { CasinoChainId } from "../..";
import type { Token } from "../../../interfaces";
import { getBetSwirlApiUrl } from "../../../utils/api";

export type GetFreebetsRawResponse = SignedRawFreebet[];

export type SignedRawFreebet = {
  id: number;
  player_address: Address;
  amount: string; // raw
  token: Token;
  campaign: {
    id: number;
    label: string;
  };
  expiration_date: string; // iso date
  chain_id: CasinoChainId;
  affiliate_address: Address;
  freebet_address: Address;
  signature: Hex;
};

export type SignedFreebet = {
  id: number;
  playerAddress: Address;
  amount: bigint; // raw
  formattedAmount: string;
  token: Token;
  campaign: {
    id: number;
    label: string;
  };
  expirationDate: Date; // iso date
  chainId: CasinoChainId;
  affiliateAddress: Address;
  freebetAddress: Address;
  signature: Hex;
};

/**
 * Fetches freebets for a player from the Betswirl API
 * @param player - The player's wallet address
 * @param affiliates - Array of affiliate addresses to filter freebets
 * @param withExternalBankrollFreebets - Whether to include external bankroll freebets (default: false). If true, it means some returned freebets could have a different affiliate address than the ones provided in the `affiliates` array.
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<SignedFreebet[]> - Array of formatted freebets with additional metadata
 * @throws Returns empty array if the API request fails
 */
export const fetchFreebets = async (
  player: Address,
  affiliates?: Address[],
  withExternalBankrollFreebets = false,
  testMode = false,
): Promise<SignedFreebet[]> => {
  try {
    const params = new URLSearchParams();
    params.set("player", player);
    params.set("with_external_bankroll", withExternalBankrollFreebets.toString());
    if (affiliates) {
      for (const affiliate of affiliates) {
        params.append("affiliates", affiliate);
      }
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/public/v1/freebet/bets?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetFreebetsRawResponse = await res.json();
    return response.map((freebet) => ({
      ...freebet,
      playerAddress: freebet.player_address,
      amount: BigInt(freebet.amount),
      formattedAmount: formatUnits(BigInt(freebet.amount), freebet.token.decimals),
      expirationDate: new Date(freebet.expiration_date),
      chainId: freebet.chain_id,
      affiliateAddress: freebet.affiliate_address,
      freebetAddress: freebet.freebet_address,
    }));
  } catch (error) {
    console.error("An error occured while fetching casino freebets", JSON.stringify(error));
    return [];
  }
};
