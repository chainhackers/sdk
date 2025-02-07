import { type Config as WagmiConfig } from "@wagmi/core";
import { casinoChainById } from "../data/casino";
import type { CasinoChainId } from "../data/casino";
import { ChainError } from "../errors/types";
import { ERROR_CODES } from "../errors/codes";

export function getCasinoChainId(
  wagmiConfig: WagmiConfig,
  ...overridedChainIds: Array<number | undefined>
): CasinoChainId {
  const chainId =
    overridedChainIds?.find((id) => id !== undefined) ||
    wagmiConfig.state.chainId;
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
  return chainId as CasinoChainId;
}
