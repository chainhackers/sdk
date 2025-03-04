import type { Address, Hash, Hex } from "viem";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../data/casino";
import type {
    CasinoBet,
    SubgraphToken,
    Token,
} from "../interfaces";
import type { OrderDirection, Token_OrderBy } from "../data/subgraphs/protocol/documents/types";
import {
    fetchBet,
    fetchBetByHash,
    fetchBets,
    type CasinoBetFilterStatus,
} from "../data/subgraphs/protocol/clients/bet";
import type { Bet_OrderBy } from "../data/subgraphs/protocol/documents/types";
import type { SubgraphError } from "../errors";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../constants";

import { fetchToken, fetchTokens } from "../data/subgraphs/protocol/clients/token";
import type { BetSwirlWallet } from "./wallet";

import { getCasinoChainId } from "../utils";
import type { GAS_PRICE_TYPE } from "../read";
import type { ChainId } from "../data";
import type { ALLOWANCE_TYPE } from "../actions/common/approve";
import type { ApolloCache, DefaultOptions } from "@apollo/client/core/index.js";

export interface BetSwirlClientOptions {
    gasPriceType?: GAS_PRICE_TYPE;
    gasPrice?: bigint;
    chainId?: ChainId;
    affiliate?: Hex;
    allowanceType?: ALLOWANCE_TYPE;
    pollInterval?: number;
    subgraphClient?: {
        graphqlKey?: string;
        cache?: ApolloCache<any>;
        defaultOptions?: DefaultOptions;
    };
}

export abstract class BetSwirlClient {

    public betSwirlWallet: BetSwirlWallet;
    public betSwirlDefaultOptions: BetSwirlClientOptions;

    constructor(betSwirlWallet: BetSwirlWallet, betSwirlDefaultOptions: BetSwirlClientOptions) {
        this.betSwirlWallet = betSwirlWallet;
        this.betSwirlDefaultOptions = betSwirlDefaultOptions;
    }

    /* Subgraph queries */

    async fetchBets(
        chainId?: CasinoChainId,
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
        const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
        return fetchBets(
            { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
            filter,
            page,
            itemsPerPage,
            sortBy
        );
    }

    async fetchBet(
        id: string | bigint,
        chainId?: CasinoChainId
    ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
        const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
        return fetchBet(
            id
            ,
            { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
        );
    }

    async fetchBetByHash(
        placeBetHash: Hash,
        chainId?: CasinoChainId
    ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
        const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
        return fetchBetByHash(
            placeBetHash,
            { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId }
        );
    }

    async fetchTokens(
        chainId?: CasinoChainId,
        page = DEFAULT_PAGE,
        itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
        sortBy?: { key: Token_OrderBy; order: OrderDirection }
    ): Promise<{ tokens: SubgraphToken[]; error: SubgraphError | undefined }> {
        const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
        return fetchTokens(
            { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
            page,
            itemsPerPage,
            sortBy
        );
    }

    async fetchToken(
        address: Address,
        chainId?: CasinoChainId
    ): Promise<{ token: SubgraphToken | undefined; error: SubgraphError | undefined }> {
        const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
        return fetchToken(
            address,
            { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
        );
    }

}