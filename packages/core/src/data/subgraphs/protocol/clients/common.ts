import { InMemoryCache, type ApolloCache, type DefaultOptions, type FetchPolicy } from "@apollo/client/core/index.js";
import { casinoChainById, type CasinoChainId } from "../../../casino";
import { replaceGraphQlKey } from "../../../../utils/subgraphs";
import { FORMAT_TYPE } from "../../../../utils/format";

export interface SubgraphCasinoClient {
  chainId: CasinoChainId;
  theGraphKey?: string;
  cache?: ApolloCache<any>;
  defaultOptions?: DefaultOptions;
  formatType?: FORMAT_TYPE;
}

export const defaultSubgraphCasinoClient = {
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only' as FetchPolicy,
    }
  },
  formatType: FORMAT_TYPE.STANDARD
};

export function getGraphqlEndpoint(subgraphClient: SubgraphCasinoClient) {
  const casinoChain = casinoChainById[subgraphClient.chainId];
  let graphQlKey = subgraphClient.theGraphKey;
  if (graphQlKey) {
    return replaceGraphQlKey(casinoChain.graphql.endpoint, graphQlKey);
  } else return casinoChain.graphql.defaultEndpoint;
}
