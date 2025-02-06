import { casinoChainById } from "../../data/casino.ts";

import { type Config as WagmiConfig } from "@wagmi/core";
import { abi as bankAbi } from "../../abis/v2/casino/bank.ts";
import { zeroAddress } from "viem";
import { readContract } from "@wagmi/core";
import type { CasinoToken } from "../../interfaces.ts";
import type { CasinoChainId } from "../../data/casino.ts";
import { TransactionError } from "../../errors/types.ts";
import { ERROR_CODES } from "../../errors/codes.ts";

export async function getCasinoTokensForChain(
  wagmiConfig: WagmiConfig,
  chainId: CasinoChainId,
  onlyActive = false
): Promise<CasinoToken[]> {
  try {
    const casinoChain = casinoChainById[chainId];
    const rawTokens = await readContract(wagmiConfig, {
      abi: bankAbi,
      address: casinoChain.contracts.bank,
      chainId: chainId,
      functionName: "getTokens",
    });

    return rawTokens
      .map((rawToken) => ({
        address: rawToken.tokenAddress,
        symbol:
          rawToken.tokenAddress == zeroAddress
            ? casinoChain.viemChain.nativeCurrency.symbol
            : rawToken.symbol,
        decimals: rawToken.decimals,
        paused: !rawToken.token.allowed || rawToken.token.paused,
        balanceRisk: rawToken.token.balanceRisk,
        bankrollProvider: rawToken.token.bankrollProvider,
        chainId,
        houseEdgeSplit: {
          bank: rawToken.token.houseEdgeSplitAndAllocation.bank,
          dividend: rawToken.token.houseEdgeSplitAndAllocation.dividend,
          affiliate: rawToken.token.houseEdgeSplitAndAllocation.affiliate,
          treasury: rawToken.token.houseEdgeSplitAndAllocation.treasury,
          team: rawToken.token.houseEdgeSplitAndAllocation.team,
        },
      }))
      .filter((token) => !onlyActive || !token.paused);
  } catch (error) {
    throw new TransactionError("Error getting tokens", {
      errorCode: ERROR_CODES.BANK.GET_TOKENS_ERROR,
      chainId,
      cause: error,
    });
  }
}
