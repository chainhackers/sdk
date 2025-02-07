import { type Config as WagmiConfig } from "@wagmi/core";
import type { Hex, TransactionReceipt } from "viem";
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
  CasinoGameToken,
  CasinoToken,
  Token,
} from "../interfaces";
import { getBetRequirements, getCasinoTokens } from "../read/casino/bank";
import { getCasinoChainId } from "../utils/chains";

export interface BetSwirlClientOptions {
  gasPriceType?: GAS_PRICE_TYPE;
  gasPrice?: bigint;
  chainId?: ChainId;
  affiliate?: Hex;
  allowanceType?: ALLOWANCE_TYPE;
  pollInterval?: number;
}

export class BetSwirlClient {
  private wagmiConfig: WagmiConfig;
  private betSwirlDefaultOptions: BetSwirlClientOptions;

  constructor(
    wagmiConfig: WagmiConfig,
    betSwirlDefaultOptions: BetSwirlClientOptions = {}
  ) {
    this.wagmiConfig = wagmiConfig;
    this.betSwirlDefaultOptions = betSwirlDefaultOptions;
  }

  /* Games */
  async playCoinToss(
    params: CoinTossParams,
    chainId?: CasinoChainId
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return placeCoinTossBet(
      this.wagmiConfig,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: casinoChainId,
      }
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
    chainId?: CasinoChainId
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return placeDiceBet(
      this.wagmiConfig,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: casinoChainId,
      }
    );
  }

  async waitDice(
    placedBet: DicePlacedBet,
    options: CasinoWaitRollOptions
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }> {
    return waitDiceRolledBet(this.wagmiConfig, placedBet, options);
  }

  /* Utilities */

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
    chainId?: CasinoChainId
  ): Promise<BetRequirements> {
    const casinoChainId = this._getCasinoChainId(chainId);
    return getBetRequirements(
      this.wagmiConfig,
      token,
      multiplier,
      casinoChainId
    );
  }

  /* Private */
  _getCasinoChainId(
    ...overridedChainIds: Array<number | undefined>
  ): CasinoChainId {
    return getCasinoChainId(this.wagmiConfig, ...overridedChainIds);
  }

  static init(
    config: WagmiConfig,
    options?: BetSwirlClientOptions
  ): BetSwirlClient {
    return new BetSwirlClient(config, options);
  }
}

export function initBetSwirlClient(
  config: WagmiConfig,
  options?: BetSwirlClientOptions
): BetSwirlClient {
  return BetSwirlClient.init(config, options);
}
