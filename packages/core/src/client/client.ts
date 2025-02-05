import { type Config as WagmiConfig } from "@wagmi/core";
import type { Hex, TransactionReceipt } from "viem";
import { type ChainId } from "../data/chains.ts";
import {
  placeCoinTossBet,
  type CoinTossInputs,
  type CoinTossPlacedBet,
} from "../actions/casino/cointoss.ts";
import type { CasinoChainId } from "../data/casino.ts";
import { casinoChainById } from "../data/casino.ts";
import { ChainError } from "../errors/types.ts";
import { ERROR_CODES } from "../errors/codes.ts";
import type { GAS_PRICE_TYPE } from "../read/gasPrice.ts";
import type { ALLOWANCE_TYPE } from "../actions/common/approve.ts";
import type { CasinoWaitRollOptions } from "../read/casino/game.ts";
import {
  waitCoinTossRolledBet,
  type CoinTossRolledBet,
} from "../read/casino/cointoss.ts";

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

  async playCoinToss(
    inputs: CoinTossInputs
  ): Promise<{ placedBet: CoinTossPlacedBet; receipt: TransactionReceipt }> {
    const chainId = this._getCasinoChainId();
    return placeCoinTossBet(
      this.wagmiConfig,
      { ...inputs, affiliate: this.betSwirlDefaultOptions.affiliate },
      {
        ...this.betSwirlDefaultOptions,
        chainId: chainId as CasinoChainId | undefined,
      }
    );
  }

  async waitCoinToss(
    placedBet: CoinTossPlacedBet,
    options: CasinoWaitRollOptions
  ): Promise<{ rolledBet: CoinTossRolledBet; receipt: TransactionReceipt }> {
    return waitCoinTossRolledBet(this.wagmiConfig, placedBet, options);
  }

  _getCasinoChainId(): CasinoChainId | undefined {
    const chainId = this.betSwirlDefaultOptions.chainId;
    if (chainId && !(chainId in casinoChainById)) {
      throw new ChainError(
        `Chain ID ${chainId} is not compatible with casino games`,
        {
          chainId,
          supportedChains: Object.keys(casinoChainById),
          errorCode: ERROR_CODES.CHAIN.UNSUPPORTED_CHAIN,
        }
      );
    }
    return chainId as CasinoChainId | undefined;
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
