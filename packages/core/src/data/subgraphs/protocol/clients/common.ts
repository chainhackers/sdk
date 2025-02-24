import { InMemoryCache, type ApolloCache } from "@apollo/client/core/index.js";
import { casinoChainById, type CasinoChainId } from "../../../casino";
import { replaceGraphQlKey } from "../../../../utils/subgraphs";

export interface SubgraphCasinoClient {
  chainId: CasinoChainId;
  theGraphKey?: string;
  cache?: ApolloCache<any>;
}

export const defaultSubgraphCasinoClient = {
  cache: new InMemoryCache(),
};

export function getGraphqlEndpoint(subgraphClient: SubgraphCasinoClient) {
  const casinoChain = casinoChainById[subgraphClient.chainId];
  let graphQlKey = subgraphClient.theGraphKey;
  if (graphQlKey) {
    return replaceGraphQlKey(casinoChain.graphql.endpoint, graphQlKey);
  } else return casinoChain.graphql.defaultEndpoint;
}
