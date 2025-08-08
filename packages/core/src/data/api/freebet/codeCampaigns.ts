import { type Address, formatUnits } from "viem";
import type { Token } from "../../../interfaces";
import { getBetSwirlApiUrl } from "../../../utils/api";
import {
  type CasinoChainId,
  type ChainId,
  type FREEBET_CAMPAIGN_STATUS,
  type FreebetCampaign,
  formatRawFreebetCampaign,
  type RawAggregatedFreebetCampaign,
} from "../..";

export type RawTokenWithChainId = Token & {
  chain_id: number;
};

export type TokenWithChainId = Token & {
  chainId: ChainId;
};

export type RawVolumeRequirements = {
  tokens: RawTokenWithChainId[];
  affiliate_id: string;
  chain_ids: number[];
  minimum_usd_volume: number; // raw (cents)
  time_period: number; // seconds
};

export type RawAggregatedFreebetCodeCampaign = {
  campaign: RawAggregatedFreebetCampaign;
  code: {
    id: number;
    is_private_mode: boolean;
    codes: {
      code: string;
      claim_count: number;
      wager_count: number;
    }[];
    bet_count: number;
    bet_amount: string; // raw
    expiration_time: number; // seconds
    volume_requirements: RawVolumeRequirements;
  };
};

export type FreebetCodeCampaign = {
  campaign: FreebetCampaign;
  code: {
    id: number;
    isPrivateMode: boolean;
    codes: {
      code: string;
      claimCount: number;
      wagerCount: number;
    }[];
    betCount: number;
    betAmount: bigint;
    formattedBetAmount: string;
    expirationTime: number;
    volumeRequirements: {
      tokens: TokenWithChainId[];
      affiliateId: string;
      chainIds: ChainId[];
      minimumUsdVolume: number; // raw (cents)
      timePeriod: number; // seconds
    };
  };
};

export type GetCodeCampaignsRawResponse = {
  campaigns: RawAggregatedFreebetCodeCampaign[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Fetches freebet code campaigns from the Betswirl API
 * @param limit - The number of campaigns to fetch
 * @param offset - The offset of the campaigns to fetch
 * @param status - The status of the campaigns to fetch
 * @param affiliate - The affiliate address to filter campaigns
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<FreebetCodeCampaign[]> - Array of freebet code campaigns
 * @throws Returns empty array if the API request fails
 */
export const fetchFreebetCodeCampaigns = async (
  limit = 10,
  offset = 0,
  status?: FREEBET_CAMPAIGN_STATUS,
  affiliate?: Address,
  chainId?: CasinoChainId,
  testMode = false,
): Promise<{ campaigns: FreebetCodeCampaign[]; total: number; offset: number; limit: number }> => {
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
    if (chainId) {
      params.set("chain_id", chainId.toString());
    }
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/affiliate/v1/freebet/code-campaigns?${params.toString()}`,
      {
        // This is needed to get the JWT cookie from the browser
        credentials: "include",
      },
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetCodeCampaignsRawResponse = await res.json();
    return {
      campaigns: response.campaigns.map((campaign) => formatRawFreebetCodeCampaign(campaign)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  } catch (error) {
    console.error("An error occured while fetching freebet code campaigns", error);
    return {
      campaigns: [],
      total: 0,
      offset,
      limit,
    };
  }
};

export type GetCodeCampaignRawResponse = RawAggregatedFreebetCodeCampaign;

/**
 * Fetches freebet code campaign by id from the Betswirl API
 * @param id - The code campaign id
 * @param testMode - Whether to use test mode API endpoint (default: false)
 * @returns Promise<FreebetCodeCampaign> - The freebet code campaign
 * @throws Returns null if the API request fails or campaign is not found
 */
export const fetchFreebetCodeCampaign = async (
  id: number,
  testMode = false,
): Promise<FreebetCodeCampaign | null> => {
  try {
    const res = await fetch(
      `${getBetSwirlApiUrl(testMode)}/affiliate/v1/freebet/code-campaigns/${id}`,
      {
        // This is needed to get the JWT cookie from the browser
        credentials: "include",
      },
    );
    if (!res.ok) {
      throw new Error(`Status ${res.status}: ${res.statusText}`);
    }

    const response: GetCodeCampaignRawResponse = await res.json();
    return formatRawFreebetCodeCampaign(response);
  } catch (error) {
    console.error("An error occured while fetching the freebet code campaign", error);
    return null;
  }
};

export const formatRawFreebetCodeCampaign = (
  campaign: RawAggregatedFreebetCodeCampaign,
): FreebetCodeCampaign => ({
  campaign: formatRawFreebetCampaign(campaign.campaign),
  code: {
    id: campaign.code.id,
    isPrivateMode: campaign.code.is_private_mode,
    codes: campaign.code.codes.map((code) => ({
      code: code.code,
      claimCount: code.claim_count,
      wagerCount: code.wager_count,
    })),
    betCount: campaign.code.bet_count,
    betAmount: BigInt(campaign.code.bet_amount),
    formattedBetAmount: formatUnits(
      BigInt(campaign.code.bet_amount),
      campaign.campaign.token.decimals,
    ),
    expirationTime: campaign.code.expiration_time,
    volumeRequirements: {
      tokens: campaign.code.volume_requirements.tokens.map((token) => ({
        ...token,
        chainId: token.chain_id as ChainId,
      })),
      affiliateId: campaign.code.volume_requirements.affiliate_id,
      chainIds: campaign.code.volume_requirements.chain_ids as ChainId[],
      minimumUsdVolume: campaign.code.volume_requirements.minimum_usd_volume,
      timePeriod: campaign.code.volume_requirements.time_period,
    },
  },
});
