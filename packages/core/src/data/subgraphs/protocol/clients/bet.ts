import { formatUnits, getAddress, zeroAddress, type Address } from "viem";
import {
  CASINO_GAME_SUBGRAPH_TYPE,
  CASINO_GAME_TYPE,
  casinoChainById,
  subgraphGameByType,
  typeBySubgraphCasinoGame,
  type CasinoChainId,
} from "../../../casino";
import type { BetFragment } from "../documents/fragments/bet";
import {
  chainNativeCurrencyToToken,
  decodeCasinoInput,
  decodeCasinoRolled,
} from "../../../../utils";
import type { CasinoBet, Token } from "../../../../interfaces";
import type { Bet_OrderBy, OrderDirection } from "../documents/types";
import { ApolloClient } from "@apollo/client/core";
import {
  defaultSubgraphCasinoClient,
  getGraphqlEndpoint,
  type SubgraphCasinoClient,
} from "./common";
import {
  BetsDocument,
  type BetsQuery,
  type BetsQueryVariables,
} from "../documents/bets";
import {
  BetDocument,
  type BetQuery,
  type BetQueryVariables,
} from "../documents/bet";
import { SubgraphError } from "../../../../errors/types";
import { ERROR_CODES } from "../../../../errors";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../../../../constants";

export function formatCasinoBet(
  bet: BetFragment,
  chainId: CasinoChainId
): CasinoBet {
  const casinoChain = casinoChainById[chainId];
  const betAmount = bet.betAmount ? BigInt(bet.betAmount) : 0n;
  const nativeCurrency = casinoChain.viemChain.nativeCurrency;
  const token =
    bet.gameToken.token.address == zeroAddress
      ? chainNativeCurrencyToToken(nativeCurrency)
      : {
          address: getAddress(bet.gameToken.token.address),
          symbol: bet.gameToken.token.symbol,
          decimals: bet.gameToken.token.decimals,
        };
  const game =
    typeBySubgraphCasinoGame[bet.gameId as CASINO_GAME_SUBGRAPH_TYPE];
  const totalBetAmount = betAmount * BigInt(bet.betCount);
  const rollTotalBetAmount = bet.rollTotalBetAmount
    ? BigInt(bet.rollTotalBetAmount)
    : undefined;
  const benefit =
    rollTotalBetAmount && bet.payout
      ? BigInt(bet.payout) - BigInt(rollTotalBetAmount)
      : undefined;
  const encodedRolled = bet.encodedRolled ? bet.encodedRolled : undefined;
  const isWin =
    rollTotalBetAmount && bet.payout
      ? BigInt(bet.payout) >= rollTotalBetAmount
      : undefined;
  const isStopTriggered = encodedRolled
    ? encodedRolled.length != Number(bet.betCount)
    : undefined;
  return {
    id: BigInt(bet.id),
    token,
    nativeCurrency: chainNativeCurrencyToToken(nativeCurrency),
    chainId,
    game,
    gameAddress: getAddress(bet.gameAddress),
    bettor: getAddress(bet.user.address),
    betAmount,
    formattedBetAmount: Number(formatUnits(betAmount, token.decimals)),
    betCount: Number(bet.betCount),
    totalBetAmount: totalBetAmount,
    formattedTotalBetAmount: Number(
      formatUnits(totalBetAmount, token.decimals)
    ),
    stopLoss: BigInt(bet.stopLoss),
    formattedStopLoss: Number(
      formatUnits(BigInt(bet.stopLoss), token.decimals)
    ),
    stopGain: BigInt(bet.stopGain),
    formattedStopGain: Number(
      formatUnits(BigInt(bet.stopGain), token.decimals)
    ),
    houseEdge: bet.houseEdge, // BP
    betTimestampSecs: Number(bet.betTimestamp), // secs
    betDate: new Date(Math.round(Number(bet.betTimestamp) * 1000)),
    chargedVRFFees: BigInt(bet.chargedVRFFees),
    formattedChargedVRFFees: Number(
      formatUnits(BigInt(bet.chargedVRFFees), nativeCurrency.decimals)
    ),
    betTxnHash: bet.betTxnHash,
    encodedInput: bet.encodedInput,
    decodedInput: decodeCasinoInput(bet.encodedInput, game),
    payout: bet.payout ? BigInt(bet.payout) : undefined,
    formattedPayout: bet.payout
      ? Number(formatUnits(BigInt(bet.payout), token.decimals))
      : undefined,
    payoutMultiplier: bet.payoutMultiplier
      ? Number(bet.payoutMultiplier)
      : undefined,
    benefit,
    formattedBenefit: benefit
      ? Number(formatUnits(benefit, token.decimals))
      : undefined,
    rollTxnHash: bet.rollTxnHash,
    rollTimestampSecs: bet.rollTimestamp
      ? Number(bet.rollTimestamp)
      : undefined, // secs
    rollDate: bet.rollTimestamp
      ? new Date(Math.round(Number(bet.rollTimestamp) * 1000))
      : undefined,
    isResolved: bet.isResolved,
    isRefunded: bet.isRefunded,
    rollTotalBetAmount,
    fomattedRollTotalBetAmount: rollTotalBetAmount
      ? Number(formatUnits(rollTotalBetAmount, token.decimals))
      : undefined,
    rollBetCount: encodedRolled?.length,
    encodedRolled,
    decodedRolled: encodedRolled?.map((encoded) =>
      decodeCasinoRolled(encoded, game)
    ),
    affiliate: bet.affiliate?.address ? bet.affiliate.address : undefined,
    isWin,
    isLost: isWin === undefined ? undefined : !isWin,
    isStopLossTriggered:
      isStopTriggered === undefined ? undefined : isStopTriggered && !isWin,
    isStopGainTriggered:
      isStopTriggered === undefined ? undefined : isStopTriggered && isWin,
  };
}

export enum CasinoBetFilterStatus {
  RESOLVED = "RESOLVED",
  PENDING = "PENDING",
}

export async function fetchBets(
  client: SubgraphCasinoClient,
  filter?: {
    bettor?: Address;
    game?: CASINO_GAME_TYPE;
    token?: Token;
    status?: CasinoBetFilterStatus;
    affiliates?: Address[];
  },
  page = DEFAULT_PAGE,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  sortBy?: { key: Bet_OrderBy; order: OrderDirection }
): Promise<{ bets: CasinoBet[]; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    uri: getGraphqlEndpoint(client),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
  });

  const variables: BetsQueryVariables = {
    first: itemsPerPage,
    skip: itemsPerPage * (page - 1),
    where: {
      ...(filter?.bettor && { user: filter.bettor.toLowerCase() }),
      ...(filter?.game && { gameId: subgraphGameByType[filter.game] }),
      ...(filter?.token && {
        gameToken_: { token: filter.token.address.toLowerCase() },
      }),
      ...(filter?.status !== undefined && {
        resolved: filter.status === CasinoBetFilterStatus.RESOLVED,
      }),
      ...(filter?.affiliates?.length && {
        affiliate_in: filter.affiliates.map((a) => a.toLowerCase()),
      }),
    },
    orderBy: sortBy?.key,
    orderDirection: sortBy?.order,
  };

  const { data, error } = await apolloClient.query<
    BetsQuery,
    BetsQueryVariables
  >({
    query: BetsDocument,
    variables,
  });

  return {
    bets: data?.bets.map((bet) => formatCasinoBet(bet, client.chainId)) ?? [],
    error: error
      ? new SubgraphError(
          "Error fetching bets",
          ERROR_CODES.SUBGRAPH.FETCH_BETS_ERROR,
          error
        )
      : undefined,
  };
}

export async function fetchBet(
  client: SubgraphCasinoClient,
  id: string | bigint
): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
  const apolloClient = new ApolloClient({
    uri: getGraphqlEndpoint(client),
    cache: client.cache ?? defaultSubgraphCasinoClient.cache,
  });

  const { data, error } = await apolloClient.query<BetQuery, BetQueryVariables>(
    {
      query: BetDocument,
      variables: {
        id: id.toString(),
      },
    }
  );

  return {
    bet: data.bet ? formatCasinoBet(data.bet, client.chainId) : undefined,
    error: error
      ? new SubgraphError(
          "Error fetching bet",
          ERROR_CODES.SUBGRAPH.FETCH_BET_ERROR,
          error
        )
      : undefined,
  };
}
