import type {
  BetRequirements,
  BetSwirlClientOptions,
  CASINO_GAME_TYPE,
  CasinoChainId,
  CasinoGameToken,
  CasinoPlaceBetOptions,
  CasinoPlacedBet,
  CasinoRolledBet,
  CasinoToken,
  CasinoWaitRollOptions,
  ChainId,
  CoinTossParams,
  CoinTossPlacedBet,
  CoinTossRolledBet,
  DiceParams,
  DicePlacedBet,
  DiceRolledBet,
  GAS_PRICE_TYPE,
  KenoConfiguration,
  KenoParams,
  KenoPlacedBet,
  KenoRolledBet,
  PlaceBetCallbacks,
  RouletteParams,
  RoulettePlacedBet,
  RouletteRolledBet,
  Token,
  WeightedGameConfiguration,
} from "@betswirl/sdk-core";
import {
  BetSwirlClient,
  casinoChainById,
  getBetRequirements,
  getCasinoGameToken,
  getCasinoGames,
  getCasinoTokens,
  getChainlinkVrfCost,
  getKenoConfiguration,
  getWeightedGameConfiguration,
  placeCoinTossBet,
  placeDiceBet,
  placeKenoBet,
  placeRouletteBet,
  waitCoinTossRolledBet,
  waitDiceRolledBet,
  waitKenoRolledBet,
  waitRolledBet,
  waitRouletteRolledBet,
} from "@betswirl/sdk-core";
import { type Config as WagmiConfig, switchChain } from "@wagmi/core";
import type { Hex, TransactionReceipt } from "viem";
import { WagmiBetSwirlWallet } from "./wallet";

export class WagmiBetSwirlClient extends BetSwirlClient {
  public wagmiConfig: WagmiConfig;

  constructor(wagmiConfig: WagmiConfig, betSwirlDefaultOptions: BetSwirlClientOptions = {}) {
    super(new WagmiBetSwirlWallet(wagmiConfig), betSwirlDefaultOptions);
    this.wagmiConfig = wagmiConfig;
  }

  /* Casino Games */

  async waitRolledBet(
    placedBet: CasinoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }> {
    this._switchChain(placedBet.chainId);
    return waitRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playCoinToss(
    params: CoinTossParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    this._switchChain(chainId);
    return placeCoinTossBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }> {
    this._switchChain(placedBet.chainId);
    return waitCoinTossRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playDice(
    params: DiceParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
    this._switchChain(chainId);
    return placeDiceBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitDice(
    placedBet: DicePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: DiceRolledBet; receipt: TransactionReceipt }> {
    this._switchChain(placedBet.chainId);
    return waitDiceRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playRoulette(
    params: RouletteParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    this._switchChain(chainId);
    return placeRouletteBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitRoulette(
    placedBet: RoulettePlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: RouletteRolledBet; receipt: TransactionReceipt }> {
    this._switchChain(placedBet.chainId);
    return waitRouletteRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playKeno(
    params: KenoParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }> {
    this._switchChain(chainId);
    return placeKenoBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitKeno(
    placedBet: KenoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: KenoRolledBet; receipt: TransactionReceipt }> {
    this._switchChain(placedBet.chainId);
    return waitKenoRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  /* Casino Utilities */

  async getCasinoGames(onlyActive = false, chainId?: CasinoChainId) {
    this._switchChain(chainId);
    return getCasinoGames(this.betSwirlWallet, onlyActive);
  }

  async getCasinoTokens(onlyActive = false, chainId?: CasinoChainId): Promise<CasinoToken[]> {
    this._switchChain(chainId);
    return getCasinoTokens(this.betSwirlWallet, onlyActive);
  }

  async getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex,
  ): Promise<CasinoGameToken> {
    const casinoChain = casinoChainById[casinoToken.chainId];
    this._switchChain(casinoToken.chainId);
    return getCasinoGameToken(
      this.betSwirlWallet,
      casinoToken,
      game,
      affiliate || casinoChain.defaultAffiliate,
    );
  }

  async getBetRequirements(
    token: Token,
    multiplier: number | number[],
    game: CASINO_GAME_TYPE,
    chainId?: CasinoChainId,
  ): Promise<BetRequirements> {
    this._switchChain(chainId);
    return getBetRequirements(this.betSwirlWallet, token, multiplier, game);
  }

  async getChainlinkVrfCost(
    game: CASINO_GAME_TYPE,
    tokenAddress: Hex,
    betCount: number,
    gasPrice?: bigint,
    gasPriceType?: GAS_PRICE_TYPE,
    chainId?: CasinoChainId,
  ) {
    this._switchChain(chainId);
    return getChainlinkVrfCost(
      this.betSwirlWallet,
      game,
      tokenAddress,
      betCount,
      gasPrice || this.betSwirlDefaultOptions.gasPrice,
      gasPriceType || this.betSwirlDefaultOptions.gasPriceType,
    );
  }

  async getKenoConfiguration(token: Token, chainId?: CasinoChainId): Promise<KenoConfiguration> {
    this._switchChain(chainId);
    return getKenoConfiguration(this.betSwirlWallet, token);
  }

  async getWeighedGameConfiguration(
    configId: number | string,
    chainId?: CasinoChainId,
  ): Promise<WeightedGameConfiguration> {
    this._switchChain(chainId);
    return getWeightedGameConfiguration(this.betSwirlWallet, configId);
  }

  /* Private */
  async _switchChain(chainId?: ChainId) {
    const effectiveChainId = chainId || this.betSwirlDefaultOptions.chainId;
    if (effectiveChainId) {
      const currentChainId = await this.betSwirlWallet.getChainId();
      if (currentChainId !== effectiveChainId) {
        await switchChain(this.wagmiConfig, { chainId: effectiveChainId });
      }
    }
  }

  static init(wagmiConfig: WagmiConfig, options?: BetSwirlClientOptions): WagmiBetSwirlClient {
    return new WagmiBetSwirlClient(wagmiConfig, options);
  }
}

export function initWagmiBetSwirlClient(
  wagmiConfig: WagmiConfig,
  options?: BetSwirlClientOptions,
): WagmiBetSwirlClient {
  return WagmiBetSwirlClient.init(wagmiConfig, options);
}
