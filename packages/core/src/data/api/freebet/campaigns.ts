import { type Address, formatUnits } from "viem";
import type { CasinoChainId } from "../..";
import type { Token } from "../../../interfaces";
import { getBetSwirlApiUrl } from "../../../utils/api";

export enum FREEBET_CAMPAIGN_STATUS {
  PENDING = "pending",
  EXPIRED = "expired",
}

export type RawAggregatedFreebetCampaign = {
  affiliate_address: Address;
  chain_id: CasinoChainId;
  created_at: string; // iso date
  expiration_date: string; // iso date
  id: number;
  is_bankroll_mode: boolean;
  label: string;
  signer_address: Address;
  status: FREEBET_CAMPAIGN_STATUS;
  token: Token;
  freebets: {
    id: number;
    is_wagered: boolean;
    amount: string; // raw
    player_address: Address;
  }[];
  total_count: number;
  total_wagered_count: number;
  total_amount: string; // raw
  total_wagered_amount: string; // raw
};

export type FreebetCampaign = {
  affiliateAddress: Address;
  chainId: CasinoChainId;
  createdAt: Date;
  expirationDate: Date;
  id: number;
  isBankrollMode: boolean;
  label: string;
  signerAddress: Address;
  status: FREEBET_CAMPAIGN_STATUS;
  token: Token;
  freebets: {
    id: number;
    isWagered: boolean;
    amount: bigint;
    formattedAmount: string;
    playerAddress: Address;
  }[];
  totalCount: number;
  totalWageredCount: number;
  totalAmount: bigint;
  formattedTotalAmount: string;
  totalWageredAmount: bigint;
  formattedTotalWageredAmount: string;
};

export type GetCampaignsRawResponse = {
  campaigns: RawAggregatedFreebetCampaign[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Fetches freebet campaigns from the Betswirl API
 * @param limit - The number of campaigns to fetch
 * @param offset - The offset of the campaigns to fetch
 * @param status - The status of the campaigns to fetch
 * @param affiliate - The affiliate address to filter campaigns
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<FreebetCampaign[]> - Array of freebet campaigns
 * @throws Returns empty array if the API request fails
 */
export const fetchFreebetCampaigns = async (
  limit = 10,
  offset = 0,
  status?: FREEBET_CAMPAIGN_STATUS,
  affiliate?: Address,
  testMode = false,
): Promise<{ campaigns: FreebetCampaign[]; total: number; offset: number; limit: number }> => {
  try {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", offset.toString());
    if (status) {
      params.set("status", status);
    }
    if (affiliate) {
      params.set("affiliate", affiliate);
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/affiliate/v1/freebet/campaigns?${params.toString()}`,
      {
        // This is needed to get the JWT cookie from the browser
        credentials: "include",
      },
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetCampaignsRawResponse = await res.json();
    return {
      campaigns: response.campaigns.map((campaign) => formatRawFreebetCampaign(campaign)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  } catch (error) {
    console.error("An error occured while fetching freebet campaigns", error);
    return {
      campaigns: [],
      total: 0,
      offset,
      limit,
    };
  }
};

export type GetCampaignRawResponse = RawAggregatedFreebetCampaign;

/**
 * Fetches freebet campaign by id from the Betswirl API
 * @param id - The campaign id
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<FreebetCampaign> - The freebet campaign
 * @throws Returns nullif the API request fails or campaign is not found
 */
export const fetchFreebetCampaign = async (
  id: number,
  testMode = false,
): Promise<FreebetCampaign | null> => {
  try {
    const res = await fetch(`${getBetSwirlApiUrl(testMode)}/affiliate/v1/freebet/campaigns/${id}`, {
      // This is needed to get the JWT cookie from the browser
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetCampaignRawResponse = await res.json();
    return formatRawFreebetCampaign(response);
  } catch (error) {
    console.error("An error occured while fetching the freebet campaign", error);
    return null;
  }
};

export const formatRawFreebetCampaign = (
  campaign: RawAggregatedFreebetCampaign,
): FreebetCampaign => ({
  id: campaign.id,
  affiliateAddress: campaign.affiliate_address,
  chainId: campaign.chain_id,
  createdAt: new Date(campaign.created_at),
  expirationDate: new Date(campaign.expiration_date),
  isBankrollMode: campaign.is_bankroll_mode,
  label: campaign.label,
  signerAddress: campaign.signer_address,
  status: campaign.status,
  token: campaign.token,
  freebets: campaign.freebets.map((freebet: RawAggregatedFreebetCampaign["freebets"][number]) => ({
    id: freebet.id,
    isWagered: freebet.is_wagered,
    amount: BigInt(freebet.amount),
    formattedAmount: formatUnits(BigInt(freebet.amount), campaign.token.decimals),
    playerAddress: freebet.player_address,
  })),
  totalCount: campaign.total_count,
  totalWageredCount: campaign.total_wagered_count,
  totalAmount: BigInt(campaign.total_amount),
  formattedTotalAmount: formatUnits(BigInt(campaign.total_amount), campaign.token.decimals),
  totalWageredAmount: BigInt(campaign.total_wagered_amount),
  formattedTotalWageredAmount: formatUnits(
    BigInt(campaign.total_wagered_amount),
    campaign.token.decimals,
  ),
});
