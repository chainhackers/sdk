import { type Config as WagmiConfig } from "@wagmi/core";
import type { Address, Hash, Hex, TransactionReceipt } from "viem";
import { type ChainId } from "../data/chains";
import {
  placeCoinTossBet,
  type CoinTossParams,
  type CoinTossPlacedBet,
} from "../actions/casino/coinToss";
import type { CASINO_GAME_TYPE, CasinoChainId } from "../data/casino";
import { casinoChainById } from "../data/casino";
import type { GAS_PRICE_TYPE } from "../read/common/gasPrice";
import type { ALLOWANCE_TYPE } from "../actions/common/approve";
import {
  getCasinoGames,
  getCasinoGameToken,
  type CasinoWaitRollOptions,
} from "../read/casino/game";
import {
  waitCoinTossRolledBet,
  type CoinTossRolledBet,
} from "../read/casino/coinToss";
import {
  placeDiceBet,
  type DiceParams,
  type DicePlacedBet,
} from "../actions/casino/dice";
import { waitDiceRolledBet, type DiceRolledBet } from "../read/casino/dice";
import type {
  BetRequirements,
  CasinoBet,
  CasinoGameToken,
  CasinoToken,
  Token,
} from "../interfaces";
import { getBetRequirements, getCasinoTokens } from "../read/casino/bank";
import { getCasinoChainId } from "../utils/chains";
import { getChainlinkVrfCost } from "../read/common/chainlinkVrfCost";
import type { PlaceBetCallbacks } from "../actions";
import type { OrderDirection } from "../data/subgraphs/protocol/documents/types";
import {
  fetchBet,
  fetchBetByHash,
  fetchBets,
  type CasinoBetFilterStatus,
} from "../data/subgraphs/protocol/clients/bet";
import type { Bet_OrderBy } from "../data/subgraphs/protocol/documents/types";
import type { SubgraphError } from "../errors";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../constants";
import type { ApolloCache } from "@apollo/client/core/index.js";
import {
  placeRouletteBet,
  type RouletteParams,
  type RoulettePlacedBet,
} from "../actions/casino/roulette";
import {
  waitRouletteRolledBet,
  type RouletteRolledBet,
} from "../read/casino/roulette";
import {
  getKenoConfiguration,
  type KenoConfiguration,
} from "../read/casino/keno";

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
  };
}

export class BetSwirlClient {
  public wagmiConfig: WagmiConfig;
  public betSwirlDefaultOptions: BetSwirlClientOptions;

  constructor(
    wagmiConfig: WagmiConfig,
    betSwirlDefaultOptions: BetSwirlClientOptions = {}
  ) {
    this.wagmiConfig = wagmiConfig;
    this.betSwirlDefaultOptions = betSwirlDefaultOptions;
  }

  /* Casino Games */
  async playCoinToss(
    params: CoinTossParams,
    chainId?: CasinoChainId,
    callbacks?: PlaceBetCallbacks
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return placeCoinTossBet(
      this.wagmiConfig,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: casinoChainId,
      },
      callbacks
    );
  }

  async waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options: CasinoWaitRollOptions
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }> {
    return waitCoinTossRolledBet(this.wagmiConfig, placedBet, options);
  }

  async playDice(
    params: DiceParams,
    chainId?: CasinoChainId,
    callbacks?: PlaceBetCallbacks
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return placeDiceBet(
      this.wagmiConfig,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: casinoChainId,
      },
      callbacks
    );
  }

  async waitDice(
    placedBet: DicePlacedBet,
    options: CasinoWaitRollOptions
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }> {
    return waitDiceRolledBet(this.wagmiConfig, placedBet, options);
  }

  async playRoulette(
    params: RouletteParams,
    chainId?: CasinoChainId,
    callbacks?: PlaceBetCallbacks
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return placeRouletteBet(
      this.wagmiConfig,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: casinoChainId,
      },
      callbacks
    );
  }

  async waitRoulette(
    placedBet: RoulettePlacedBet,
    options: CasinoWaitRollOptions
  ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }> {
    return waitRouletteRolledBet(this.wagmiConfig, placedBet, options);
  }

  /* Casino Utilities */

  async getCasinoGames(chainId?: CasinoChainId, onlyActive = false) {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getCasinoGames(this.wagmiConfig, casinoChainId, onlyActive);
  }

  async getCasinoTokens(
    chainId?: CasinoChainId,
    onlyActive = false
  ): Promise<CasinoToken[]> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getCasinoTokens(this.wagmiConfig, casinoChainId, onlyActive);
  }

  async getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex
  ): Promise<CasinoGameToken> {
    const casinoChain = casinoChainById[casinoToken.chainId];
    return getCasinoGameToken(
      this.wagmiConfig,
      casinoToken,
      game,
      affiliate || casinoChain.defaultAffiliate
    );
  }

  async getBetRequirements(
    token: Token,
    multiplier: number,
    game: CASINO_GAME_TYPE,
    chainId?: CasinoChainId
  ): Promise<BetRequirements> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getBetRequirements(
      this.wagmiConfig,
      token,
      multiplier,
      game,
      casinoChainId
    );
  }

  async getChainlinkVrfCost(
    game: CASINO_GAME_TYPE,
    tokenAddress: Hex,
    betCount: number,
    chainId?: CasinoChainId,
    gasPrice?: bigint,
    gasPriceType?: GAS_PRICE_TYPE
  ) {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getChainlinkVrfCost(
      this.wagmiConfig,
      game,
      tokenAddress,
      betCount,
      casinoChainId,
      gasPrice || this.betSwirlDefaultOptions.gasPrice,
      gasPriceType || this.betSwirlDefaultOptions.gasPriceType
    );
  }

  async getKenoConfiguration(
    token: Token,
    chainId?: CasinoChainId
  ): Promise<KenoConfiguration> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getKenoConfiguration(this.wagmiConfig, token, casinoChainId);
  }

  /* Casino Subgraphs */
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
    const casinoChainId = this._getCasinoChainId(chainId);
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
    const casinoChainId = this._getCasinoChainId(chainId);
    return fetchBet(
      { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
      id
    );
  }

  async fetchBetByHash(
    placeBetHash: Hash,
    chainId?: CasinoChainId
  ): Promise<{ bet: CasinoBet | undefined; error: SubgraphError | undefined }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return fetchBetByHash(
      { ...this.betSwirlDefaultOptions.subgraphClient, chainId: casinoChainId },
      placeBetHash
    );
  }

  /* Private */
  _getCasinoChainId(
    ...overridedChainIds: Array<number | undefined>
  ): CasinoChainId {
    return getCasinoChainId(this.wagmiConfig, ...overridedChainIds);
  }

  static init(
    wagmiConfig: WagmiConfig,
    options?: BetSwirlClientOptions
  ): BetSwirlClient {
    return new BetSwirlClient(wagmiConfig, options);
  }
}

export function initBetSwirlClient(
  wagmiConfig: WagmiConfig,
  options?: BetSwirlClientOptions
): BetSwirlClient {
  return BetSwirlClient.init(wagmiConfig, options);
}
