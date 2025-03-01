import { formatUnits, type Address } from "viem";
import type { SubgraphToken } from "../../../../interfaces";
import { type CasinoChainId } from "../../../casino";
import type { TokenFragment } from "../documents/fragments/token";
import { ERROR_CODES } from "../../../../errors";
import { getGraphqlEndpoint } from "./common";
import { defaultSubgraphCasinoClient } from "./common";
import { DEFAULT_ITEMS_PER_PAGE, SubgraphError } from "../../../..";
import type { SubgraphCasinoClient } from "./common";
import { DEFAULT_PAGE } from "../../../../constants";
import type { OrderDirection, Token_OrderBy } from "../documents/types";
import { ApolloClient } from "@apollo/client/core/index.js";
import { TokensDocument, type TokensQuery, type TokensQueryVariables } from "../documents/tokens";
import { TokenDocument, type TokenQuery, type TokenQueryVariables } from "../documents/token";

export function formatToken(
    token: TokenFragment,
    chainId: CasinoChainId
): SubgraphToken {
    return {
        id: token.id as Address,
        address: token.address as Address,
        chainId,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        betTxnCount: Number(token.betTxnCount),
        betCount: Number(token.betCount),
        winTxnCount: Number(token.winTxnCount),
        userCount: Number(token.userCount),
        totalWagered: BigInt(token.totalWagered),
        formattedTotalWagered: Number(formatUnits(BigInt(token.totalWagered), token.decimals)),
        totalPayout: BigInt(token.totalPayout),
        formattedTotalPayout: Number(formatUnits(BigInt(token.totalPayout), token.decimals)),
        dividendAmount: BigInt(token.dividendAmount),
        formattedDividendAmount: Number(formatUnits(BigInt(token.dividendAmount), token.decimals)),
        bankAmount: BigInt(token.bankAmount),
        formattedBankAmount: Number(formatUnits(BigInt(token.bankAmount), token.decimals)),
        affiliateAmount: BigInt(token.affiliateAmount),
        formattedAffiliateAmount: Number(formatUnits(BigInt(token.affiliateAmount), token.decimals)),
        treasuryAmount: BigInt(token.treasuryAmount),
        formattedTreasuryAmount: Number(formatUnits(BigInt(token.treasuryAmount), token.decimals)),
        teamAmount: BigInt(token.teamAmount),
        formattedTeamAmount: Number(formatUnits(BigInt(token.teamAmount), token.decimals)),
    };
}

export async function fetchTokens(
    client: SubgraphCasinoClient,
    page = DEFAULT_PAGE,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    sortBy?: { key: Token_OrderBy; order: OrderDirection }
): Promise<{ tokens: SubgraphToken[]; error: SubgraphError | undefined }> {
    const apolloClient = new ApolloClient({
        uri: getGraphqlEndpoint(client),
        cache: client.cache ?? defaultSubgraphCasinoClient.cache,
    });

    const variables: TokensQueryVariables = {
        first: itemsPerPage,
        skip: itemsPerPage * (page - 1),
        //where: {},
        orderBy: sortBy?.key,
        orderDirection: sortBy?.order,
    };

    const { data, error } = await apolloClient.query<
        TokensQuery,
        TokensQueryVariables
    >({
        query: TokensDocument,
        variables,
    });

    return {
        tokens: data?.tokens.map((token) => formatToken(token, client.chainId)) ?? [],
        error: error
            ? new SubgraphError(
                "Error fetching tokens",
                ERROR_CODES.SUBGRAPH.FETCH_TOKENS_ERROR,
                error
            )
            : undefined,
    };
}

export async function fetchToken(
    address: Address,
    client: SubgraphCasinoClient
): Promise<{ token: SubgraphToken | undefined; error: SubgraphError | undefined }> {
    const apolloClient = new ApolloClient({
        uri: getGraphqlEndpoint(client),
        cache: client.cache ?? defaultSubgraphCasinoClient.cache,
    });

    const { data, error } = await apolloClient.query<TokenQuery, TokenQueryVariables>(
        {
            query: TokenDocument,
            variables: {
                id: address.toLowerCase(),
            },
        }
    );

    return {
        token: data.token ? formatToken(data.token, client.chainId) : undefined,
        error: error
            ? new SubgraphError(
                "Error fetching token",
                ERROR_CODES.SUBGRAPH.FETCH_TOKEN_ERROR,
                error
            )
            : undefined,
    };
}