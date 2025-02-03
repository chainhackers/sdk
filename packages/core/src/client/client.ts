import { type Config as WagmiConfig } from "@wagmi/core";
import type { Hash, Transport, Account, Chain, Hex } from "viem";
import { chainByKey, type ChainId } from "../data/chains.ts";

export interface BetSwirlClientOptions {
  gasPriceType?: string; // TODO replace by enum
  gasPrice?: bigint;
    chainId?: ChainId;
    affiliate?: Hex
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

  async playCoinToss(input: string): Promise<Hash> {
    throw new Error("No implemented");
  }

  // Méthode utilitaire pour initialiser le client
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
