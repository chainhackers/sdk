import type { Address, Hash, Hex, TransactionReceipt } from "viem";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../constants";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../data/casino";
import {
  type CasinoBetFilterStatus,
  fetchBet,
  fetchBetByHash,
  fetchBets,
} from "../data/subgraphs/protocol/clients/bet";
import {
  Bet_OrderBy,
  OrderDirection,
  Token_OrderBy,
} from "../data/subgraphs/protocol/documents/types";
import type { SubgraphError } from "../errors";
import type {
  BetRequirements,
  CasinoBet,
  CasinoGame,
  CasinoGameToken,
  CasinoToken,
  SubgraphToken,
  Token,
} from "../interfaces";

import { fetchToken, fetchTokens } from "../data/subgraphs/protocol/clients/token";
import type { BetSwirlWallet } from "./wallet";

import type { ApolloCache, DefaultOptions } from "@apollo/client/core/index.js";
import type { CoinTossParams, CoinTossPlacedBet } from "../actions/casino/cointoss";
import type { DiceParams } from "../actions/casino/dice";
import type { DicePlacedBet } from "../actions/casino/dice";
import type {
  CasinoPlaceBetOptions,
  CasinoPlacedBet,
  PlaceBetCallbacks,
} from "../actions/casino/game";
import type { KenoParams, KenoPlacedBet } from "../actions/casino/keno";
import type { RouletteParams, RoulettePlacedBet } from "../actions/casino/roulette";
import type { ALLOWANCE_TYPE } from "../actions/common/approve";
import type { ChainId } from "../data";
import type {
  CasinoRolledBet,
  CasinoWaitRollOptions,
  CoinTossRolledBet,
  DiceRolledBet,
  GAS_PRICE_TYPE,
  KenoConfiguration,
  KenoRolledBet,
  RouletteRolledBet,
} from "../read";
import type { WeightedGameConfiguration } from "../read/casino/weightedGame";
import { FORMAT_TYPE, getCasinoChainId } from "../utils";

export interface BetSwirlClientOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint;
  chainId?: ChainId;
  affiliate?: Hex;
  allowanceType?: ALLOWANCE_TYPE;
  pollingInterval?: number;
  formatType?: FORMAT_TYPE;
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

  /* Casino games */

  abstract waitRolledBet(
    placedBet: CasinoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  abstract playCoinToss(
    params: CoinTossParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }>;

  abstract waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }>;

  abstract playDice(
    params: DiceParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }>;

  abstract waitDice(
    placedBet: DicePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }>;

  abstract playRoulette(
    params: RouletteParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }>;

  abstract waitRoulette(
    placedBet: RoulettePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }>;

  abstract playKeno(
    params: KenoParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
  ): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }>;

  abstract waitKeno(
    placedBet: KenoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: KenoRolledBet; receipt: TransactionReceipt }>;

  /* Casino utilities */

  abstract getCasinoGames(onlyActive?: boolean): Promise<CasinoGame[]>;

  abstract getCasinoTokens(onlyActive?: boolean): Promise<CasinoToken[]>;

  abstract getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex,
  ): Promise<CasinoGameToken>;

  abstract getBetRequirements(
    token: Token,
    multiplier: number,
    game: CASINO_GAME_TYPE,
  ): Promise<BetRequirements>;

  abstract getChainlinkVrfCost(
    game: CASINO_GAME_TYPE,
    tokenAddress: Hex,
    betCount: number,
    gasPrice?: bigint,
    gasPriceType?: GAS_PRICE_TYPE,
  ): Promise<bigint>;

  abstract getKenoConfiguration(token: Token): Promise<KenoConfiguration>;

  abstract getWeighedGameConfiguration(
    configId: number | string,
  ): Promise<WeightedGameConfiguration>;

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
    sortBy: { key: Bet_OrderBy; order: OrderDirection } = {
      key: Bet_OrderBy.BetTimestamp,
      order: OrderDirection.Desc,
    },
  ): Promise<{ bets: CasinoBet[]; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBets(
      {
        ...this.betSwirlDefaultOptions.subgraphClient,
        chainId: casinoChainId,
        formatType: this.betSwirlDefaultOptions.formatType,
      },
      filter,
      page,
      itemsPerPage,
      sortBy,
    );
  }

  async fetchBet(
    id: string | bigint,
    chainId?: CasinoChainId,
  ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBet(id, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }

  async fetchBetByHash(
    placeBetHash: Hash,
    chainId?: CasinoChainId,
  ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchBetByHash(placeBetHash, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }

  async fetchTokens(
    chainId?: CasinoChainId,
    page = DEFAULT_PAGE,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    sortBy: { key: Token_OrderBy; order: OrderDirection } = {
      key: Token_OrderBy.Symbol,
      order: OrderDirection.Asc,
    },
  ): Promise<{ tokens: SubgraphToken[]; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchTokens(
      {
        ...this.betSwirlDefaultOptions.subgraphClient,
        chainId: casinoChainId,
        formatType: this.betSwirlDefaultOptions.formatType,
      },
      page,
      itemsPerPage,
      sortBy,
    );
  }

  async fetchToken(
    address: Address,
    chainId?: CasinoChainId,
  ): Promise<{ token: SubgraphToken | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = getCasinoChainId(this.betSwirlWallet, chainId);
    return fetchToken(address, {
      ...this.betSwirlDefaultOptions.subgraphClient,
      chainId: casinoChainId,
      formatType: this.betSwirlDefaultOptions.formatType,
    });
  }
}
