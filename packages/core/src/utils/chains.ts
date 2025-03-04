import { casinoChainById } from "../data/casino";
import type { CasinoChainId } from "../data/casino";
import { ChainError } from "../errors/types";
import { ERROR_CODES } from "../errors/codes";
import type { BetSwirlWallet } from "../provider";

export function getCasinoChainId(
  wallet: BetSwirlWallet,
  ...overridedChainIds: Array<number | undefined>
): CasinoChainId {
  const chainId =
    overridedChainIds?.find((id) => id !== undefined) ||
    wallet.getChainId();
  if (chainId && !(chainId in casinoChainById)) {
    throw new ChainError(
      `Chain ID ${chainId} is not compatible with casino games`,
      ERROR_CODES.CHAIN.UNSUPPORTED_CHAIN,
      {
        chainId,
        supportedChains: Object.keys(casinoChainById),
      }
    );
  }
  return chainId as CasinoChainId;
}
