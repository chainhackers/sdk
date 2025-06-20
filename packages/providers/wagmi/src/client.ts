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
  CoinTossBetParams,
  CoinTossFreebetParams,
  CoinTossPlacedBet,
  CoinTossRolledBet,
  DiceBetParams,
  DiceFreebetParams,
  DicePlacedBet,
  DiceRolledBet,
  GAS_PRICE_TYPE,
  KenoBetParams,
  KenoConfiguration,
  KenoFreebetParams,
  KenoPlacedBet,
  KenoRolledBet,
  NormalCasinoPlacedBet,
  PlaceBetCallbacks,
  PlaceFreebetCallbacks,
  RouletteBetParams,
  RouletteFreebetParams,
  RoulettePlacedBet,
  RouletteRolledBet,
  Token,
  WeightedCasinoPlacedBet,
  WeightedGameConfiguration,
  WheelBetParams,
  WheelFreebetParams,
  WheelPlacedBet,
  WheelRolledBet,
} from "@betswirl/sdk-core";
import {
  BetSwirlClient,
  casinoChainById,
  getBetRequirements,
  getCasinoGames,
  getCasinoGameToken,
  getCasinoTokens,
  getChainlinkVrfCost,
  getKenoConfiguration,
  getWeightedGameConfiguration,
  placeCoinTossBet,
  placeCoinTossFreebet,
  placeDiceBet,
  placeDiceFreebet,
  placeKenoBet,
  placeKenoFreebet,
  placeRouletteBet,
  placeRouletteFreebet,
  placeWheelBet,
  placeWheelFreebet,
  WEIGHTED_CASINO_GAME_TYPES,
  waitCoinTossRolledBet,
  waitDiceRolledBet,
  waitKenoRolledBet,
  waitRolledBet,
  waitRouletteRolledBet,
  waitWheelRolledBet,
} from "@betswirl/sdk-core";
import { switchChain, type Config as WagmiConfig } from "@wagmi/core";
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
    placedBet: NormalCasinoPlacedBet,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  async waitRolledBet(
    placedBet: WeightedCasinoPlacedBet,
    options: CasinoWaitRollOptions | undefined,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: number,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }>;

  async waitRolledBet(
    placedBet: CasinoPlacedBet,
    options?: CasinoWaitRollOptions,
    weightedGameConfiguration?: WeightedGameConfiguration,
    houseEdge?: number,
  ): Promise<{ rolledBet: CasinoRolledBet; receipt: TransactionReceipt }> {
    await this._switchChain(placedBet.chainId);
    const isWeighted = WEIGHTED_CASINO_GAME_TYPES.includes(placedBet.game);
    if (isWeighted) {
      return waitRolledBet(
        this.betSwirlWallet,
        placedBet as WeightedCasinoPlacedBet,
        {
          ...this.betSwirlDefaultOptions,
          ...options,
        },
        weightedGameConfiguration!,
        houseEdge!,
      );
    }
    return waitRolledBet(this.betSwirlWallet, placedBet as NormalCasinoPlacedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playCoinToss(
    params: CoinTossBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(chainId);
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

  async playFreebetCoinToss(
    params: CoinTossFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(params.freebet.chainId);
    return placeCoinTossFreebet(
      this.betSwirlWallet,
      params,
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
    await this._switchChain(placedBet.chainId);
    return waitCoinTossRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playDice(
    params: DiceBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: DicePlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(chainId);
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

  async playFreebetDice(
    params: DiceFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: DicePlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(params.freebet.chainId);
    return placeDiceFreebet(
      this.betSwirlWallet,
      params,
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
    await this._switchChain(placedBet.chainId);
    return waitDiceRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playRoulette(
    params: RouletteBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(chainId);
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

  async playFreebetRoulette(
    params: RouletteFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: RoulettePlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(params.freebet.chainId);
    return placeRouletteFreebet(
      this.betSwirlWallet,
      params,
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
    await this._switchChain(placedBet.chainId);
    return waitRouletteRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playKeno(
    params: KenoBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: KenoPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(chainId);
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

  async playFreebetKeno(
    params: KenoFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: KenoPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(params.freebet.chainId);
    return placeKenoFreebet(
      this.betSwirlWallet,
      params,
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
    await this._switchChain(placedBet.chainId);
    return waitKenoRolledBet(this.betSwirlWallet, placedBet, {
      ...this.betSwirlDefaultOptions,
      ...options,
    });
  }

  async playWheel(
    params: WheelBetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceBetCallbacks,
    chainId?: CasinoChainId,
  ): Promise<{ placedBet: WheelPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(chainId);
    return placeWheelBet(
      this.betSwirlWallet,
      { ...params, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async playFreebetWheel(
    params: WheelFreebetParams,
    options?: CasinoPlaceBetOptions,
    callbacks?: PlaceFreebetCallbacks,
  ): Promise<{ placedFreebet: WheelPlacedBet; receipt: TransactionReceipt }> {
    await this._switchChain(params.freebet.chainId);
    return placeWheelFreebet(
      this.betSwirlWallet,
      params,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
      callbacks,
    );
  }

  async waitWheel(
    placedBet: WheelPlacedBet,
    weightedGameConfiguration: WeightedGameConfiguration,
    houseEdge: number,
    options?: CasinoWaitRollOptions,
  ): Promise<{ rolledBet: WheelRolledBet; receipt: TransactionReceipt }> {
    await this._switchChain(placedBet.chainId);
    return waitWheelRolledBet(
      this.betSwirlWallet,
      placedBet,
      weightedGameConfiguration,
      houseEdge,
      {
        ...this.betSwirlDefaultOptions,
        ...options,
      },
    );
  }

  /* Casino Utilities */

  async getCasinoGames(onlyActive = false, chainId?: CasinoChainId) {
    await this._switchChain(chainId);
    return getCasinoGames(this.betSwirlWallet, onlyActive);
  }

  async getCasinoTokens(onlyActive = false, chainId?: CasinoChainId): Promise<CasinoToken[]> {
    await this._switchChain(chainId);
    return getCasinoTokens(this.betSwirlWallet, onlyActive);
  }

  async getCasinoGameToken(
    casinoToken: CasinoToken,
    game: CASINO_GAME_TYPE,
    affiliate?: Hex,
  ): Promise<CasinoGameToken> {
    const casinoChain = casinoChainById[casinoToken.chainId];
    await this._switchChain(casinoToken.chainId);
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
    await this._switchChain(chainId);
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
    await this._switchChain(chainId);
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
    await this._switchChain(chainId);
    return getKenoConfiguration(this.betSwirlWallet, token);
  }

  async getWeighedGameConfiguration(
    configId: number | string,
    chainId?: CasinoChainId,
  ): Promise<WeightedGameConfiguration> {
    await this._switchChain(chainId);
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
